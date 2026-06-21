-- Planogram Compliance System Seed Data
-- Creates default system admin user
-- Default email: admin@example.com
-- Default password: Admin@123 (bcrypt hashed with 10 salt rounds)

INSERT INTO users (id, name, email, password_hash, role, client_id, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'System Administrator',
  'admin@example.com',
  '$2b$10$wN9P3XJb3p0iN456qHhBzeI0Yw/QvR9e1l6Gz1xNlh1xL4k4N1g1W', -- Hashed 'Admin@123'
  'admin',
  NULL,
  true
)
ON CONFLICT (email) DO UPDATE 
SET name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    updated_at = CURRENT_TIMESTAMP;
