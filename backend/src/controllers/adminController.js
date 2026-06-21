const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const sharp = require('sharp');
const { pool, query } = require('../config/db');
const { minioClient } = require('../config/minio');
const env = require('../config/env');
const embeddingQueue = require('../queues/embeddingQueue');
const { ValidationError, NotFoundError, InternalServerError } = require('../utils/errors');

const adminController = {
  // --- Clients CRUD ---
  listClients: async (req, res, next) => {
    try {
      const result = await query('SELECT id, name, contact_email, is_active, created_at FROM clients ORDER BY name ASC');
      res.status(200).json(result.rows);
    } catch (err) {
      next(err);
    }
  },

  createClient: async (req, res, next) => {
    try {
      const { name, contactEmail } = req.body;
      if (!name) {
        throw new ValidationError('Client name is required', 'MISSING_CLIENT_NAME');
      }

      const id = uuidv4();
      const insertQuery = `
        INSERT INTO clients (id, name, contact_email) 
        VALUES ($1, $2, $3) 
        RETURNING id, name, contact_email, is_active, created_at
      `;
      const result = await query(insertQuery, [id, name, contactEmail]);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  },

  // --- Stores CRUD ---
  listStores: async (req, res, next) => {
    try {
      const { id: clientId } = req.params; // Clients ID
      const result = await query(
        'SELECT id, client_id, name, location, is_active, created_at FROM stores WHERE client_id = $1 ORDER BY name ASC',
        [clientId]
      );
      res.status(200).json(result.rows);
    } catch (err) {
      next(err);
    }
  },

  createStore: async (req, res, next) => {
    try {
      const { id: clientId } = req.params;
      const { name, location } = req.body;

      if (!name) {
        throw new ValidationError('Store name is required', 'MISSING_STORE_NAME');
      }

      // Verify client exists
      const clientCheck = await query('SELECT id FROM clients WHERE id = $1', [clientId]);
      if (clientCheck.rows.length === 0) {
        throw new NotFoundError('Client not found', 'CLIENT_NOT_FOUND');
      }

      const id = uuidv4();
      const insertQuery = `
        INSERT INTO stores (id, client_id, name, location) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, client_id, name, location, is_active, created_at
      `;
      const result = await query(insertQuery, [id, clientId, name, location]);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  },

  // --- Sections CRUD ---
  listSections: async (req, res, next) => {
    try {
      const { id: storeId } = req.params;
      const result = await query(
        'SELECT id, store_id, name, is_active, created_at FROM sections WHERE store_id = $1 ORDER BY name ASC',
        [storeId]
      );
      res.status(200).json(result.rows);
    } catch (err) {
      next(err);
    }
  },

  createSection: async (req, res, next) => {
    try {
      const { id: storeId } = req.params;
      const { name } = req.body;

      if (!name) {
        throw new ValidationError('Section name is required', 'MISSING_SECTION_NAME');
      }

      // Verify store exists
      const storeCheck = await query('SELECT id FROM stores WHERE id = $1', [storeId]);
      if (storeCheck.rows.length === 0) {
        throw new NotFoundError('Store not found', 'STORE_NOT_FOUND');
      }

      const id = uuidv4();
      const insertQuery = `
        INSERT INTO sections (id, store_id, name) 
        VALUES ($1, $2, $3) 
        RETURNING id, store_id, name, is_active, created_at
      `;
      const result = await query(insertQuery, [id, storeId, name]);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  },

  // --- User Management ---
  listUsers: async (req, res, next) => {
    try {
      const result = await query('SELECT id, name, email, role, is_active FROM users ORDER BY name ASC');
      res.status(200).json(result.rows);
    } catch (err) {
      next(err);
    }
  },

  createUser: async (req, res, next) => {
    try {
      const { name, email, password, role, clientId } = req.body;

      if (!name || !email || !password || !role) {
        throw new ValidationError('Name, email, password, and role are required', 'MISSING_USER_FIELDS');
      }

      const allowedRoles = ['admin', 'agent', 'client_manager'];
      if (!allowedRoles.includes(role)) {
        throw new ValidationError('Invalid role selection', 'INVALID_ROLE');
      }

      if (role === 'client_manager' && !clientId) {
        throw new ValidationError('clientId is required for client managers', 'MISSING_CLIENT_ID');
      }

      // Check unique lower email case-insensitively
      const emailCheck = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
      if (emailCheck.rows.length > 0) {
        throw new ValidationError('User with this email already exists', 'EMAIL_ALREADY_EXISTS');
      }

      // Hash password using bcrypt
      const passwordHash = await bcrypt.hash(password, 10);
      const id = uuidv4();

      const insertQuery = `
        INSERT INTO users (id, name, email, password_hash, role, client_id) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING id, name, email, role, client_id, is_active, created_at
      `;
      const result = await query(insertQuery, [id, name, email, passwordHash, role, role === 'client_manager' ? clientId : null]);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  },

  // --- Agent assignments ---
  assignAgent: async (req, res, next) => {
    try {
      const { agentId, storeId } = req.body;

      if (!agentId || !storeId) {
        throw new ValidationError('agentId and storeId are required', 'MISSING_ASSIGNMENT_FIELDS');
      }

      // Verify user is an agent
      const agentCheck = await query('SELECT role FROM users WHERE id = $1', [agentId]);
      if (agentCheck.rows.length === 0) {
        throw new NotFoundError('Agent user not found', 'AGENT_NOT_FOUND');
      }
      if (agentCheck.rows[0].role !== 'agent') {
        throw new ValidationError('Assigned user must have agent role', 'INVALID_ROLE_ASSIGNMENT');
      }

      // Verify store exists
      const storeCheck = await query('SELECT id FROM stores WHERE id = $1', [storeId]);
      if (storeCheck.rows.length === 0) {
        throw new NotFoundError('Store not found', 'STORE_NOT_FOUND');
      }

      // Check if assignment already exists
      const duplicateCheck = await query(
        'SELECT id FROM agent_store_assignments WHERE agent_id = $1 AND store_id = $2',
        [agentId, storeId]
      );
      if (duplicateCheck.rows.length > 0) {
        res.status(200).json({ success: true, message: 'Agent is already assigned to this store' });
        return;
      }

      try {
        const id = uuidv4();
        const insertQuery = `
          INSERT INTO agent_store_assignments (id, agent_id, store_id) 
          VALUES ($1, $2, $3) 
          RETURNING id, agent_id, store_id, assigned_at
        `;
        const result = await query(insertQuery, [id, agentId, storeId]);
        res.status(201).json(result.rows[0]);
      } catch (err) {
        if (err.code === '23505') {
          res.status(200).json({ success: true, message: 'Agent is already assigned to this store' });
          return;
        }
        throw err;
      }
    } catch (err) {
      next(err);
    }
  },

  // --- Reference Product Upload ---
  uploadReferenceProduct: async (req, res, next) => {
    try {
      const { clientId, name, skuCode } = req.body;
      const file = req.file;

      if (!clientId || !name || !skuCode || !file) {
        throw new ValidationError('clientId, name, skuCode, and product image are required', 'MISSING_PRODUCT_FIELDS');
      }

      // Check if client exists
      const clientCheck = await query('SELECT id FROM clients WHERE id = $1', [clientId]);
      if (clientCheck.rows.length === 0) {
        throw new NotFoundError('Client not found', 'CLIENT_NOT_FOUND');
      }

      // Process image using Sharp - standard scaling preserving aspect ratio
      const processedBuffer = await sharp(file.buffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .toFormat('jpeg')
        .toBuffer();

      const productId = uuidv4();
      const objectName = `${productId}.jpg`;
      const bucketName = 'reference-products';

      // Save to MinIO
      await minioClient.putObject(
        bucketName,
        objectName,
        processedBuffer,
        processedBuffer.length,
        { 'Content-Type': 'image/jpeg' }
      );

      const imageUrl = `http://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}/${bucketName}/${objectName}`;

      // Insert product record in pending status
      const insertQuery = `
        INSERT INTO reference_products (id, client_id, name, sku_code, image_url, embedding_status) 
        VALUES ($1, $2, $3, $4, $5, 'pending') 
        RETURNING id, client_id, name, sku_code, image_url, embedding_status, created_at
      `;
      const result = await query(insertQuery, [productId, clientId, name, skuCode, imageUrl]);
      
      // Trigger background worker for ResNet50 embedding generation
      await embeddingQueue.add('generate_embedding', {
        referenceProductId: productId,
        imagePath: objectName // pass the filename in MinIO
      });

      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  },

  checkEmbeddingStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await query(
        'SELECT id, name, sku_code, embedding_status, created_at FROM reference_products WHERE id = $1',
        [id]
      );
      if (result.rows.length === 0) {
        throw new NotFoundError('Reference product not found', 'PRODUCT_NOT_FOUND');
      }
      res.status(200).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  },

  // --- Planogram CRUD ---
  listPlanograms: async (req, res, next) => {
    try {
      const result = await query('SELECT id, section_id, name, is_active, reference_image_url, created_at FROM planograms ORDER BY created_at DESC');
      res.status(200).json(result.rows);
    } catch (err) {
      next(err);
    }
  },

  createPlanogram: async (req, res, next) => {
    try {
      const { sectionId, name, referenceImageUrl } = req.body;

      if (!sectionId || !name) {
        throw new ValidationError('sectionId and name are required', 'MISSING_PLANOGRAM_FIELDS');
      }

      // Check if section exists
      const sectionCheck = await query('SELECT id FROM sections WHERE id = $1', [sectionId]);
      if (sectionCheck.rows.length === 0) {
        throw new NotFoundError('Section not found', 'SECTION_NOT_FOUND');
      }

      const id = uuidv4();
      const insertQuery = `
        INSERT INTO planograms (id, section_id, name, reference_image_url, is_active) 
        VALUES ($1, $2, $3, $4, false) 
        RETURNING id, section_id, name, is_active, reference_image_url, created_at
      `;
      const result = await query(insertQuery, [id, sectionId, name, referenceImageUrl]);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  },

  // --- Planogram Cell CRUD ---
  definePlanogramCells: async (req, res, next) => {
    const { id: planogramId } = req.params;
    const { cells } = req.body; // Array of { row, position, referenceProductId, facingCount }

    if (!Array.isArray(cells) || cells.length === 0) {
      throw new ValidationError('cells must be a non-empty array', 'INVALID_CELLS_PAYLOAD');
    }

    // Verify planogram exists
    const planogramCheck = await query('SELECT id FROM planograms WHERE id = $1', [planogramId]);
    if (planogramCheck.rows.length === 0) {
      throw new NotFoundError('Planogram not found', 'PLANOGRAM_NOT_FOUND');
    }

    const pgClient = await pool.connect();
    try {
      await pgClient.query('BEGIN');

      // Clear existing cells for this planogram
      await pgClient.query('DELETE FROM planogram_cells WHERE planogram_id = $1', [planogramId]);

      // Insert new cells
      const insertQuery = `
        INSERT INTO planogram_cells (id, planogram_id, row, position, reference_product_id, facing_count) 
        VALUES ($1, $2, $3, $4, $5, $6)
      `;

      for (const cell of cells) {
        const { row, position, referenceProductId, facingCount } = cell;

        if (row === undefined || position === undefined || !referenceProductId) {
          throw new ValidationError('Each cell must specify row, position, and referenceProductId', 'INVALID_CELL_DATA');
        }

        if (row <= 0) {
          throw new ValidationError('row must be greater than 0', 'INVALID_ROW');
        }
        if (position <= 0) {
          throw new ValidationError('position must be greater than 0', 'INVALID_POSITION');
        }

        const count = facingCount !== undefined ? facingCount : 1;
        if (count <= 0) {
          throw new ValidationError('facingCount must be greater than 0', 'INVALID_FACING_COUNT');
        }

        // Verify referenceProductId exists
        const productCheck = await pgClient.query('SELECT id FROM reference_products WHERE id = $1', [referenceProductId]);
        if (productCheck.rows.length === 0) {
          throw new NotFoundError(`Reference product ${referenceProductId} not found`, 'PRODUCT_NOT_FOUND');
        }

        const cellId = uuidv4();
        await pgClient.query(insertQuery, [cellId, planogramId, row, position, referenceProductId, count]);
      }

      await pgClient.query('COMMIT');
      res.status(201).json({ success: true, message: 'Planogram cells defined successfully' });
    } catch (err) {
      await pgClient.query('ROLLBACK');
      next(err);
    } finally {
      pgClient.release();
    }
  },

  activatePlanogram: async (req, res, next) => {
    const { id: planogramId } = req.params;

    // Verify planogram exists and get section_id
    const planogramResult = await query('SELECT id, section_id FROM planograms WHERE id = $1', [planogramId]);
    if (planogramResult.rows.length === 0) {
      throw new NotFoundError('Planogram not found', 'PLANOGRAM_NOT_FOUND');
    }

    const sectionId = planogramResult.rows[0].section_id;
    const pgClient = await pool.connect();

    try {
      await pgClient.query('BEGIN');

      // Deactivate all planograms for this section
      await pgClient.query('UPDATE planograms SET is_active = false WHERE section_id = $1', [sectionId]);

      // Activate the targeted planogram
      await pgClient.query('UPDATE planograms SET is_active = true WHERE id = $1', [planogramId]);

      await pgClient.query('COMMIT');
      res.status(200).json({ success: true, message: 'Planogram activated successfully' });
    } catch (err) {
      await pgClient.query('ROLLBACK');
      next(err);
    } finally {
      pgClient.release();
    }
  },

  // --- Flags Listing & Resolution ---
  listFlags: async (req, res, next) => {
    try {
      const result = await query(`
        SELECT f.id, f.store_id, s.name as store_name, f.section_id, sec.name as section_name, 
               f.flag_reason, f.flagged_at, f.resolved_at, f.resolved_by, f.is_active, f.notes 
        FROM store_flags f
        JOIN stores s ON f.store_id = s.id
        LEFT JOIN sections sec ON f.section_id = sec.id
        ORDER BY f.flagged_at DESC
      `);
      res.status(200).json(result.rows);
    } catch (err) {
      next(err);
    }
  },

  resolveFlag: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const userId = req.user.userId;

      if (!notes) {
        throw new ValidationError('Resolution notes are required', 'MISSING_RESOLUTION_NOTES');
      }

      // Check if flag exists and is active
      const flagCheck = await query('SELECT id, is_active FROM store_flags WHERE id = $1', [id]);
      if (flagCheck.rows.length === 0) {
        throw new NotFoundError('Store flag not found', 'FLAG_NOT_FOUND');
      }
      if (!flagCheck.rows[0].is_active) {
        throw new ValidationError('This flag is already resolved', 'FLAG_ALREADY_RESOLVED');
      }

      const updateQuery = `
        UPDATE store_flags 
        SET is_active = false, 
            resolved_at = CURRENT_TIMESTAMP, 
            resolved_by = $1, 
            notes = $2 
        WHERE id = $3 
        RETURNING id, store_id, flag_reason, is_active, resolved_at, notes
      `;
      const result = await query(updateQuery, [userId, notes, id]);
      res.status(200).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = adminController;
