const { Worker } = require('bullmq');
const axios = require('axios');
const { redisConfig } = require('../config/redis');
const { pool, query } = require('../config/db');
const env = require('../config/env');

console.log('Starting Compliance Check Worker...');

const complianceWorker = new Worker('compliance_check', async (job) => {
  const { jobId, shelfImagePath, planogramId, sectionId, storeId } = job.data;
  console.log(`[Compliance Worker] Processing job ${jobId} for store ${storeId}, section ${sectionId}`);

  try {
    // 1. Update job status to processing in DB
    await query(
      "UPDATE compliance_jobs SET status = 'processing', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [jobId]
    );

    // 2. HTTP call to CV service
    const cvUrl = `${env.CV_SERVICE_URL}/process/compliance`;
    console.log(`[Compliance Worker] Requesting CV Service compliance check: ${cvUrl}`);
    const response = await axios.post(cvUrl, {
      jobId,
      shelfImagePath,
      planogramId,
      sectionId,
      storeId
    });

    if (response.status !== 200) {
      throw new Error(`CV Service responded with HTTP status ${response.status}`);
    }

    if (!response.data || typeof response.data !== 'object') {
      throw new Error('CV Service responded with malformed JSON body');
    }

    const {
      status,
      overall_score,
      product_accuracy,
      spacing_accuracy,
      facing_accuracy,
      annotated_image_url,
      violations
    } = response.data;

    if (status !== 'complete') {
      throw new Error(`CV Service process status is not complete: ${status}`);
    }

    // 3. Database transaction to insert results, violations and update scores
    const pgClient = await pool.connect();
    try {
      await pgClient.query('BEGIN');

      // 3.1 Insert compliance_results
      const resultId = require('uuid').v4();
      const insertResultQuery = `
        INSERT INTO compliance_results (
          id, job_id, store_id, section_id, overall_score, 
          product_accuracy, spacing_accuracy, facing_accuracy, 
          annotated_image_url, violations_json
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;
      await pgClient.query(insertResultQuery, [
        resultId,
        jobId,
        storeId,
        sectionId,
        overall_score,
        product_accuracy,
        spacing_accuracy,
        facing_accuracy,
        annotated_image_url,
        JSON.stringify(violations)
      ]);

      // 3.2 Insert compliance_violations
      if (Array.isArray(violations) && violations.length > 0) {
        const insertViolationQuery = `
          INSERT INTO compliance_violations (
            id, result_id, row, position, violation_type, 
            expected_product_id, detected_product_id, expected_gap, detected_gap
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;

        for (const violation of violations) {
          const violationId = require('uuid').v4();
          
          // Verify if expected_product_id or detected_product_id are valid UUIDs, default to NULL if they are placeholders/empty
          const isValidUUID = (uuid) => {
            return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
          };

          const expectedId = isValidUUID(violation.expected_product_id) ? violation.expected_product_id : null;
          const detectedId = isValidUUID(violation.detected_product_id) ? violation.detected_product_id : null;

          await pgClient.query(insertViolationQuery, [
            violationId,
            resultId,
            violation.row,
            violation.position,
            violation.violation_type,
            expectedId,
            detectedId,
            violation.expected_gap,
            violation.detected_gap
          ]);
        }
      }

      // 3.3 Calculate average scores for store and section
      const calcScoresQuery = `
        SELECT AVG(overall_score) as avg_score, COUNT(*) as total_checks 
        FROM compliance_results 
        WHERE store_id = $1 AND section_id = $2
      `;
      const scoreStats = await pgClient.query(calcScoresQuery, [storeId, sectionId]);
      const avgScore = parseFloat(scoreStats.rows[0].avg_score) || 0.0;
      const totalChecks = parseInt(scoreStats.rows[0].total_checks, 10) || 0;

      // 3.4 Upsert into store_scores
      const checkScoreQuery = `
        SELECT id FROM store_scores WHERE store_id = $1 AND section_id = $2
      `;
      const scoreCheck = await pgClient.query(checkScoreQuery, [storeId, sectionId]);

      if (scoreCheck.rows.length > 0) {
        const updateScoreQuery = `
          UPDATE store_scores 
          SET avg_score = $1, total_checks = $2, last_check_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
          WHERE store_id = $3 AND section_id = $4
        `;
        await pgClient.query(updateScoreQuery, [avgScore, totalChecks, storeId, sectionId]);
      } else {
        const insertScoreQuery = `
          INSERT INTO store_scores (id, store_id, section_id, avg_score, total_checks, last_check_at) 
          VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        `;
        const scoreId = require('uuid').v4();
        await pgClient.query(insertScoreQuery, [scoreId, storeId, sectionId, avgScore, totalChecks]);
      }

      await pgClient.query('COMMIT');
    } catch (txErr) {
      await pgClient.query('ROLLBACK');
      throw txErr;
    } finally {
      pgClient.release();
    }

    // 4. Update job status to complete in DB
    await query(
      "UPDATE compliance_jobs SET status = 'complete', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [jobId]
    );

    console.log(`[Compliance Worker] Job ${jobId} completed and stored compliance results successfully`);
    return { status: 'complete', jobId };
  } catch (err) {
    console.error(`[Compliance Worker] Error processing compliance job ${jobId}:`, err.message);

    // Update status to failed in database
    try {
      await query(
        "UPDATE compliance_jobs SET status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [jobId]
      );
    } catch (dbErr) {
      console.error(`[Compliance Worker] Failed to mark compliance job ${jobId} as failed in DB:`, dbErr.message);
    }

    // Rethrow to let BullMQ handle retry/fail logic
    throw err;
  }
}, {
  connection: redisConfig,
  concurrency: 3
});

complianceWorker.on('completed', (job, result) => {
  console.log(`[Compliance Worker] Job ${job.id} completed successfully. Result:`, result);
});

complianceWorker.on('failed', (job, err) => {
  console.error(`[Compliance Worker] Job ${job?.id} failed after attempts:`, err.message);
});

module.exports = complianceWorker;
