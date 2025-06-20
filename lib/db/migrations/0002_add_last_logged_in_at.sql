-- Migration: Add last_logged_in_at column to users table
-- Created: 2024-01-XX

ALTER TABLE users 
ADD COLUMN last_logged_in_at TIMESTAMP WITH TIME ZONE;

-- Add index for performance on login time queries
CREATE INDEX idx_users_last_logged_in ON users(last_logged_in_at);

-- Update existing users to have a default last login time (optional)
-- UPDATE users SET last_logged_in_at = created_at WHERE last_logged_in_at IS NULL;
