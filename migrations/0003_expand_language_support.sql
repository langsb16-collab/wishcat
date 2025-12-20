-- Expand language support to include Vietnamese, Thai, Spanish, German
-- Drop CHECK constraints and recreate without language restrictions

-- Drop old tables and recreate without CHECK constraints on language
-- This is safe for local development

-- Recreate category_translations without CHECK constraint
DROP TABLE IF EXISTS category_translations_new;
CREATE TABLE category_translations_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  language TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  UNIQUE(category_id, language),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Copy data
INSERT INTO category_translations_new SELECT * FROM category_translations;

-- Replace table
DROP TABLE category_translations;
ALTER TABLE category_translations_new RENAME TO category_translations;

-- Recreate skill_translations without CHECK constraint
DROP TABLE IF EXISTS skill_translations_new;
CREATE TABLE skill_translations_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_id INTEGER NOT NULL,
  language TEXT NOT NULL,
  name TEXT NOT NULL,
  UNIQUE(skill_id, language),
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- Copy data
INSERT INTO skill_translations_new SELECT * FROM skill_translations;

-- Replace table
DROP TABLE skill_translations;
ALTER TABLE skill_translations_new RENAME TO skill_translations;

-- Update users table to support new languages
-- Note: SQLite doesn't support ALTER TABLE to modify CHECK constraints
-- We need to recreate the table
CREATE TABLE users_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  nickname TEXT UNIQUE NOT NULL,
  phone_number TEXT NOT NULL,
  country TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK(user_type IN ('client', 'freelancer', 'both')),
  membership_type TEXT NOT NULL DEFAULT 'free' CHECK(membership_type IN ('free', 'premium')),
  membership_expires_at DATETIME,
  profile_photo_url TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'ko',
  usdt_wallet_address TEXT,
  is_verified INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy existing users data
INSERT INTO users_new SELECT * FROM users;

-- Replace table
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

-- Recreate indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_membership ON users(membership_type);
