-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admin sessions table for authentication
CREATE TABLE IF NOT EXISTS admin_sessions (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (email, password_hash, name, role) 
VALUES ('admin@eventhub.com', '$2b$10$rOvHPxfzO2.KjB8YvFfzKOqP5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K', 'Admin User', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Reference the correct users_sync table instead of users
-- Add admin_notes column to users_sync table for admin management
ALTER TABLE users_sync ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE users_sync ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- Create audit log table for admin actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES admin_users(id),
  action VARCHAR(255) NOT NULL,
  target_type VARCHAR(100) NOT NULL,
  target_id INTEGER,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
