-- Create admin user for testing
-- Admin credentials: admin@feezero.com

-- Update existing user or create new admin
UPDATE users SET 
  membership_type = 'admin',
  is_admin = 1
WHERE id = 1;

-- If no user exists, insert admin
INSERT OR IGNORE INTO users (
  id, email, nickname, phone_number, country, user_type, 
  membership_type, is_admin, is_active, password_hash
) VALUES (
  1, 'admin@feezero.com', 'Admin', NULL, 'KR', 'admin', 
  'admin', 1, 1, 'admin123'
);

-- Create some test users with different membership types
INSERT OR IGNORE INTO users (email, nickname, country, user_type, membership_type, is_active, password_hash) VALUES
('free1@test.com', 'Free User 1', 'KR', 'client', 'free', 1, 'password123'),
('free2@test.com', 'Free User 2', 'US', 'client', 'free', 1, 'password123'),
('premium1@test.com', 'Premium User 1', 'KR', 'freelancer', 'premium', 1, 'password123'),
('premium2@test.com', 'Premium User 2', 'JP', 'freelancer', 'premium', 1, 'password123');
