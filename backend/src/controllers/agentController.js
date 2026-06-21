const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const { query } = require('../config/db');
const { minioClient } = require('../config/minio');
const env = require('../config/env');
const complianceQueue = require('../queues/complianceQueue');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors');

const agentController = {
  getAssignedStores: async (req, res, next) => {
    try {
      const agentId = req.user.userId;

      const result = await query(
        `SELECT s.id, s.name, s.location, s.client_id 
         FROM stores s 
         JOIN agent_store_assignments a ON s.id = a.store_id 
         WHERE a.agent_id = $1 AND a.is_active = true AND s.is_active = true
         ORDER BY s.name ASC`,
        [agentId]
      );

      res.status(200).json(result.rows);
    } catch (err) {
      next(err);
    }
  },

  getSections: async (req, res, next) => {
    try {
      const storeId = req.params.id;

      // Security: verify agent is assigned to this store
      if (!req.user.storeIds.includes(storeId)) {
        throw new ForbiddenError('Access denied to this store', 'STORE_ACCESS_DENIED');
      }

      const result = await query(
        'SELECT id, store_id, name, is_active FROM sections WHERE store_id = $1 AND is_active = true ORDER BY name ASC',
        [storeId]
      );

      res.status(200).json(result.rows);
    } catch (err) {
      next(err);
    }
  },

  createComplianceJob: async (req, res, next) => {
    try {
      const { storeId, sectionId } = req.body;
      let { planogramId } = req.body;
      const file = req.file;

      if (!storeId || !sectionId || !file) {
        throw new ValidationError('storeId, sectionId, and image file are required', 'MISSING_COMPLIANCE_FIELDS');
      }

      // Security: verify agent is assigned to this store
      if (!req.user.storeIds.includes(storeId)) {
        throw new ForbiddenError('Access denied to this store', 'STORE_ACCESS_DENIED');
      }

      // Verify store and section exist
      const storeCheck = await query('SELECT id FROM stores WHERE id = $1 AND is_active = true', [storeId]);
      if (storeCheck.rows.length === 0) {
        throw new NotFoundError('Store not found or is inactive', 'STORE_NOT_FOUND');
      }

      const sectionCheck = await query(
        'SELECT id FROM sections WHERE id = $1 AND store_id = $2 AND is_active = true',
        [sectionId, storeId]
      );
      if (sectionCheck.rows.length === 0) {
        throw new NotFoundError('Section not found or does not belong to the store', 'SECTION_NOT_FOUND');
      }

      // Resolve planogram
      if (planogramId) {
        // If provided, verify it belongs to the section and is active
        const planoCheck = await query(
          'SELECT id FROM planograms WHERE id = $1 AND section_id = $2 AND is_active = true',
          [planogramId, sectionId]
        );
        if (planoCheck.rows.length === 0) {
          throw new ValidationError('Specified planogram is not active for this section', 'PLANOGRAM_NOT_ACTIVE');
        }
      } else {
        // If not provided, fetch the active planogram for the section
        const planoCheck = await query(
          'SELECT id FROM planograms WHERE section_id = $1 AND is_active = true LIMIT 1',
          [sectionId]
        );
        if (planoCheck.rows.length === 0) {
          throw new ValidationError('No active planogram found for this section', 'NO_ACTIVE_PLANOGRAM');
        }
        planogramId = planoCheck.rows[0].id;
      }

      // Process image using Sharp
      const processedBuffer = await sharp(file.buffer)
        .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
        .toFormat('jpeg')
        .toBuffer();

      const jobId = uuidv4();
      const objectName = `${jobId}.jpg`;
      const bucketName = 'shelf-images';

      // Save to MinIO
      await minioClient.putObject(
        bucketName,
        objectName,
        processedBuffer,
        processedBuffer.length,
        { 'Content-Type': 'image/jpeg' }
      );

      const shelfImageUrl = `http://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}/${bucketName}/${objectName}`;

      // Insert compliance job record
      const insertQuery = `
        INSERT INTO compliance_jobs (id, store_id, section_id, agent_id, planogram_id, shelf_image_url, status) 
        VALUES ($1, $2, $3, $4, $5, $6, 'queued') 
        RETURNING id, store_id, section_id, planogram_id, shelf_image_url, status, created_at
      `;
      const result = await query(insertQuery, [
        jobId,
        storeId,
        sectionId,
        req.user.userId,
        planogramId,
        shelfImageUrl
      ]);

      // Push job to compliance queue
      await complianceQueue.add('process_compliance', {
        jobId,
        shelfImagePath: objectName,
        planogramId,
        sectionId,
        storeId
      });

      res.status(202).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  },

  getComplianceJobStatus: async (req, res, next) => {
    try {
      const jobId = req.params.id;

      const jobResult = await query(
        'SELECT id, store_id, section_id, planogram_id, status, created_at, updated_at FROM compliance_jobs WHERE id = $1',
        [jobId]
      );

      if (jobResult.rows.length === 0) {
        throw new NotFoundError('Compliance job not found', 'JOB_NOT_FOUND');
      }

      const job = jobResult.rows[0];

      // Security: verify agent is assigned to this store
      if (!req.user.storeIds.includes(job.store_id)) {
        throw new ForbiddenError('Access denied to this store job', 'STORE_ACCESS_DENIED');
      }

      res.status(200).json(job);
    } catch (err) {
      next(err);
    }
  },

  getComplianceResult: async (req, res, next) => {
    try {
      const { jobId } = req.params;

      // Fetch compliance result
      const resultQuery = `
        SELECT id, job_id, store_id, section_id, overall_score, 
               product_accuracy, spacing_accuracy, facing_accuracy, 
               annotated_image_url, violations_json, created_at 
        FROM compliance_results 
        WHERE job_id = $1
      `;
      const resultCheck = await query(resultQuery, [jobId]);

      if (resultCheck.rows.length === 0) {
        throw new NotFoundError('Compliance result not found for this job ID', 'RESULT_NOT_FOUND');
      }

      const result = resultCheck.rows[0];

      // Security: verify agent is assigned to this store
      if (!req.user.storeIds.includes(result.store_id)) {
        throw new ForbiddenError('Access denied to this store result', 'STORE_ACCESS_DENIED');
      }

      // Fetch violations
      const violationsQuery = `
        SELECT id, row, position, violation_type, expected_product_id, 
               detected_product_id, expected_gap, detected_gap 
        FROM compliance_violations 
        WHERE result_id = $1
      `;
      const violationsResult = await query(violationsQuery, [result.id]);

      res.status(200).json({
        ...result,
        violations: violationsResult.rows
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = agentController;
