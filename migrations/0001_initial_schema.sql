-- FeeZero Platform Database Schema
-- Version: 1.0
-- Date: 2025-12-10

-- ===========================
-- Users Table (Multi-language support)
-- ===========================
CREATE TABLE IF NOT EXISTS users (
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
  preferred_language TEXT NOT NULL DEFAULT 'ko' CHECK(preferred_language IN ('ko', 'en', 'zh', 'ja')),
  usdt_wallet_address TEXT,
  is_verified INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ===========================
-- Freelancer Profiles
-- ===========================
CREATE TABLE IF NOT EXISTS freelancer_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  title TEXT,
  bio TEXT,
  hourly_rate DECIMAL(10, 2),
  project_rate DECIMAL(10, 2),
  availability TEXT CHECK(availability IN ('available', 'busy', 'unavailable')),
  total_projects INTEGER DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  success_rate DECIMAL(5, 2) DEFAULT 0.00,
  average_rating DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  response_time_hours INTEGER DEFAULT 24,
  languages TEXT, -- JSON array: ["ko", "en", "zh", "ja"]
  certifications TEXT, -- JSON array
  work_hours TEXT, -- JSON: {"timezone": "Asia/Seoul", "hours": "9-18"}
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===========================
-- Portfolio Items
-- ===========================
CREATE TABLE IF NOT EXISTS portfolio_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  freelancer_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  project_url TEXT,
  category_id INTEGER,
  display_order INTEGER DEFAULT 0,
  is_featured INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (freelancer_id) REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ===========================
-- Categories (Multi-language)
-- ===========================
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- ===========================
-- Category Translations
-- ===========================
CREATE TABLE IF NOT EXISTS category_translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  language TEXT NOT NULL CHECK(language IN ('ko', 'en', 'zh', 'ja')),
  name TEXT NOT NULL,
  description TEXT,
  UNIQUE(category_id, language),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- ===========================
-- Projects
-- ===========================
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  category_id INTEGER,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget_min DECIMAL(10, 2),
  budget_max DECIMAL(10, 2),
  budget_type TEXT CHECK(budget_type IN ('fixed', 'hourly')),
  duration_days INTEGER,
  required_skills TEXT, -- JSON array
  project_files TEXT, -- JSON array of file URLs
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'completed', 'cancelled', 'disputed')),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK(visibility IN ('public', 'private', 'invited')),
  is_urgent INTEGER DEFAULT 0,
  deadline DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ===========================
-- Project Bids/Proposals
-- ===========================
CREATE TABLE IF NOT EXISTS project_bids (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  freelancer_id INTEGER NOT NULL,
  bid_amount DECIMAL(10, 2) NOT NULL,
  estimated_days INTEGER NOT NULL,
  proposal_text TEXT NOT NULL,
  attachment_urls TEXT, -- JSON array
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (freelancer_id) REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
  UNIQUE(project_id, freelancer_id)
);

-- ===========================
-- Contracts
-- ===========================
CREATE TABLE IF NOT EXISTS contracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  bid_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  freelancer_id INTEGER NOT NULL,
  contract_amount DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL, -- 2% for clients, 0% for freelancers
  start_date DATETIME NOT NULL,
  end_date DATETIME,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled', 'disputed')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK(payment_status IN ('pending', 'escrowed', 'released', 'refunded')),
  escrow_txn_hash TEXT, -- USDT transaction hash
  release_txn_hash TEXT,
  contract_terms TEXT, -- JSON: detailed terms
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (bid_id) REFERENCES project_bids(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===========================
-- Messages (Basic structure for third-party integration)
-- ===========================
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK(message_type IN ('text', 'file', 'voice', 'system')),
  message_content TEXT NOT NULL,
  file_url TEXT,
  is_read INTEGER DEFAULT 0,
  third_party_message_id TEXT, -- For integration with external messaging services
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===========================
-- Reviews and Ratings
-- ===========================
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id INTEGER NOT NULL,
  reviewer_id INTEGER NOT NULL,
  reviewee_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  review_text TEXT,
  response_text TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(contract_id, reviewer_id)
);

-- ===========================
-- Payments (USDT)
-- ===========================
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id INTEGER,
  user_id INTEGER NOT NULL,
  payment_type TEXT NOT NULL CHECK(payment_type IN ('deposit', 'withdrawal', 'escrow', 'release', 'refund', 'membership')),
  amount DECIMAL(10, 2) NOT NULL,
  fee_amount DECIMAL(10, 2) DEFAULT 0.00,
  net_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USDT',
  txn_hash TEXT UNIQUE, -- Blockchain transaction hash
  wallet_from TEXT,
  wallet_to TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  third_party_payment_id TEXT, -- For payment gateway integration
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===========================
-- Skills
-- ===========================
CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  category_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ===========================
-- Skill Translations
-- ===========================
CREATE TABLE IF NOT EXISTS skill_translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_id INTEGER NOT NULL,
  language TEXT NOT NULL CHECK(language IN ('ko', 'en', 'zh', 'ja')),
  name TEXT NOT NULL,
  UNIQUE(skill_id, language),
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- ===========================
-- Freelancer Skills (Many-to-Many)
-- ===========================
CREATE TABLE IF NOT EXISTS freelancer_skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  freelancer_id INTEGER NOT NULL,
  skill_id INTEGER NOT NULL,
  proficiency_level TEXT CHECK(proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_experience INTEGER,
  UNIQUE(freelancer_id, skill_id),
  FOREIGN KEY (freelancer_id) REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- ===========================
-- Notifications
-- ===========================
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===========================
-- User Activity Logs
-- ===========================
CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  activity_type TEXT NOT NULL,
  activity_data TEXT, -- JSON data
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===========================
-- Disputes
-- ===========================
CREATE TABLE IF NOT EXISTS disputes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id INTEGER NOT NULL,
  raised_by_id INTEGER NOT NULL,
  dispute_type TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT, -- JSON array
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'investigating', 'resolved', 'closed')),
  resolution TEXT,
  resolved_by_id INTEGER,
  resolved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
  FOREIGN KEY (raised_by_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (resolved_by_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ===========================
-- Favorites/Bookmarks
-- ===========================
CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  target_type TEXT NOT NULL CHECK(target_type IN ('freelancer', 'project')),
  target_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, target_type, target_id)
);

-- ===========================
-- Indexes for Performance
-- ===========================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_membership ON users(membership_type);
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_user_id ON freelancer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_freelancer_id ON portfolio_items(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_category_id ON projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_bids_project_id ON project_bids(project_id);
CREATE INDEX IF NOT EXISTS idx_project_bids_freelancer_id ON project_bids(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_project_id ON contracts(project_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_freelancer_id ON contracts(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_reviews_contract_id ON reviews(contract_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_contract_id ON payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_disputes_contract_id ON disputes(contract_id);
