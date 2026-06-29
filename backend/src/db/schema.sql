-- Enable database extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'agent', 'client_manager');
CREATE TYPE embedding_status_type AS ENUM ('pending', 'processing', 'complete', 'failed');
CREATE TYPE job_status_type AS ENUM ('queued', 'processing', 'complete', 'failed');
CREATE TYPE violation_type AS ENUM ('wrong_product', 'missing_product', 'gap_violation', 'facing_violation');
CREATE TYPE flag_reason_type AS ENUM ('low_score', 'recurring_violation', 'overdue_submission');

-- 1. clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  contact_email VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. stores
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  name VARCHAR NOT NULL,
  location VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. sections
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
  name VARCHAR NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE, -- Unique constraint is handled via lower case-insensitive index
  password_hash VARCHAR NOT NULL,
  role user_role NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE RESTRICT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. agent_store_assignments
CREATE TABLE agent_store_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(agent_id, store_id)
);

-- 6. reference_products
CREATE TABLE reference_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  name VARCHAR NOT NULL,
  sku_code VARCHAR NOT NULL,
  image_url VARCHAR,
  embedding VECTOR(2048),
  embedding_status embedding_status_type DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. planograms
CREATE TABLE planograms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE RESTRICT,
  name VARCHAR NOT NULL,
  is_active BOOLEAN DEFAULT false,
  reference_image_url VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. planogram_cells
CREATE TABLE planogram_cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planogram_id UUID NOT NULL REFERENCES planograms(id) ON DELETE RESTRICT,
  row INTEGER NOT NULL,
  position INTEGER NOT NULL,
  reference_product_id UUID NOT NULL REFERENCES reference_products(id) ON DELETE RESTRICT,
  facing_count INTEGER DEFAULT 1 CHECK (facing_count > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(planogram_id, row, position)
);

-- 9. compliance_jobs
CREATE TABLE compliance_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE RESTRICT,
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  planogram_id UUID REFERENCES planograms(id) ON DELETE RESTRICT,
  shelf_image_url VARCHAR NOT NULL,
  status job_status_type DEFAULT 'queued',
  bullmq_job_id VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. compliance_results
CREATE TABLE compliance_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES compliance_jobs(id) ON DELETE RESTRICT,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE RESTRICT,
  overall_score DECIMAL(5,2) NOT NULL,
  product_accuracy DECIMAL(5,2) NOT NULL,
  spacing_accuracy DECIMAL(5,2) NOT NULL,
  facing_accuracy DECIMAL(5,2) NOT NULL,
  annotated_image_url VARCHAR,
  violations_json JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. compliance_violations
CREATE TABLE compliance_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID NOT NULL REFERENCES compliance_results(id) ON DELETE RESTRICT,
  row INTEGER NOT NULL,
  position INTEGER NOT NULL,
  violation_type violation_type NOT NULL,
  expected_product_id UUID REFERENCES reference_products(id) ON DELETE RESTRICT,
  detected_product_id UUID REFERENCES reference_products(id) ON DELETE RESTRICT,
  expected_gap DECIMAL,
  detected_gap DECIMAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. store_scores
CREATE TABLE store_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE RESTRICT,
  avg_score DECIMAL(5,2) NOT NULL,
  total_checks INTEGER DEFAULT 0,
  last_check_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. store_flags
CREATE TABLE store_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
  section_id UUID REFERENCES sections(id) ON DELETE RESTRICT,
  flag_reason flag_reason_type NOT NULL,
  flagged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES users(id) ON DELETE RESTRICT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT
);

-- Indexes for optimize query search times

-- Case-insensitive unique email index on users table
CREATE UNIQUE INDEX idx_users_email_lower ON users (LOWER(email));

-- Enforce exactly one active planogram per section
CREATE UNIQUE INDEX idx_active_planogram_per_section ON planograms(section_id) WHERE is_active = true;

-- client_id indexes
CREATE INDEX idx_stores_client_id ON stores(client_id);
CREATE INDEX idx_users_client_id ON users(client_id);
CREATE INDEX idx_ref_products_client_id ON reference_products(client_id);

-- store_id indexes
CREATE INDEX idx_sections_store_id ON sections(store_id);
CREATE INDEX idx_agent_store_assignments_store_id ON agent_store_assignments(store_id);
CREATE INDEX idx_comp_jobs_store_id ON compliance_jobs(store_id);
CREATE INDEX idx_comp_results_store_id ON compliance_results(store_id);
CREATE INDEX idx_store_scores_store_id ON store_scores(store_id);
CREATE INDEX idx_store_flags_store_id ON store_flags(store_id);

-- section_id indexes
CREATE INDEX idx_planograms_section_id ON planograms(section_id);
CREATE INDEX idx_comp_jobs_section_id ON compliance_jobs(section_id);
CREATE INDEX idx_comp_results_section_id ON compliance_results(section_id);
CREATE INDEX idx_store_scores_section_id ON store_scores(section_id);
CREATE INDEX idx_store_flags_section_id ON store_flags(section_id);

-- agent_id indexes
CREATE INDEX idx_agent_store_assignments_agent_id ON agent_store_assignments(agent_id);
CREATE INDEX idx_comp_jobs_agent_id ON compliance_jobs(agent_id);

-- planogram_id indexes
CREATE INDEX idx_planogram_cells_planogram_id ON planogram_cells(planogram_id);
CREATE INDEX idx_comp_jobs_planogram_id ON compliance_jobs(planogram_id);

-- job_id and result_id indexes
CREATE INDEX idx_comp_results_job_id ON compliance_results(job_id);
CREATE INDEX idx_comp_violations_result_id ON compliance_violations(result_id);

-- status columns indexes
CREATE INDEX idx_ref_products_embedding_status ON reference_products(embedding_status);
CREATE INDEX idx_comp_jobs_status ON compliance_jobs(status);
CREATE INDEX idx_store_flags_is_active ON store_flags(is_active);
