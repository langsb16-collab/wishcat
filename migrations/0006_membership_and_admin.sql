-- Membership and Admin System Migration
-- Adds membership types and admin functionality

-- 1. Update users table (membership_type may already exist, skip if error)
-- ALTER TABLE users ADD COLUMN membership_type TEXT DEFAULT 'free';
-- ALTER TABLE users ADD COLUMN membership_expires_at DATETIME;
-- ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0;

-- 2. Admin activity logs
CREATE TABLE IF NOT EXISTS admin_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_user_id INTEGER NOT NULL,
  action_type TEXT NOT NULL, -- user_create, user_edit, user_delete, announcement_create, etc.
  target_type TEXT NOT NULL, -- user, announcement, post, etc.
  target_id INTEGER,
  action_details TEXT, -- JSON with details
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Site posts/articles management
CREATE TABLE IF NOT EXISTS site_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_id INTEGER NOT NULL,
  
  -- Post content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  
  -- Post type
  post_type TEXT DEFAULT 'article' CHECK (post_type IN ('article', 'news', 'blog', 'guide', 'faq')),
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- SEO
  slug TEXT UNIQUE,
  meta_description TEXT,
  tags TEXT, -- JSON array
  
  -- Images
  featured_image_url TEXT,
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  
  -- Dates
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Post translations for multilingual support
CREATE TABLE IF NOT EXISTS site_post_translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  language TEXT NOT NULL,
  
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  meta_description TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (post_id) REFERENCES site_posts(id) ON DELETE CASCADE,
  UNIQUE(post_id, language)
);

-- 5. Update announcements table for admin management (skip if columns exist)
-- ALTER TABLE announcements ADD COLUMN image_url TEXT;
-- ALTER TABLE announcements ADD COLUMN created_by_user_id INTEGER REFERENCES users(id);
-- ALTER TABLE announcements ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_user_id ON admin_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action_type ON admin_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_site_posts_author_id ON site_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_site_posts_status ON site_posts(status);
CREATE INDEX IF NOT EXISTS idx_site_posts_post_type ON site_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_site_posts_slug ON site_posts(slug);

CREATE INDEX IF NOT EXISTS idx_site_post_translations_post_id ON site_post_translations(post_id);
CREATE INDEX IF NOT EXISTS idx_site_post_translations_language ON site_post_translations(language);

-- CREATE INDEX IF NOT EXISTS idx_users_membership_type ON users(membership_type);
-- CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
