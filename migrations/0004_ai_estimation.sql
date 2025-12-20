-- AI Estimation and Risk Analysis Feature Migration
-- This migration adds comprehensive AI-based project estimation and risk analysis features

-- 1. AI Estimation Results
CREATE TABLE IF NOT EXISTS ai_estimations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  
  -- Natural language input from client
  raw_requirements TEXT NOT NULL,
  
  -- AI-generated feature breakdown
  feature_count INTEGER DEFAULT 0,
  feature_list TEXT, -- JSON array of features with descriptions
  
  -- Tech stack analysis
  tech_stack TEXT, -- JSON array of recommended technologies
  tech_stack_difficulty_score INTEGER DEFAULT 3,
  
  -- Time estimation
  estimated_days_min INTEGER DEFAULT 0,
  estimated_days_appropriate INTEGER DEFAULT 0,
  estimated_days_max INTEGER DEFAULT 0,
  
  -- Budget estimation (in USDT)
  estimated_budget_min DECIMAL(12, 2) DEFAULT 0.00,
  estimated_budget_appropriate DECIMAL(12, 2) DEFAULT 0.00,
  estimated_budget_max DECIMAL(12, 2) DEFAULT 0.00,
  
  -- Overall project difficulty (1-5)
  overall_difficulty_score INTEGER DEFAULT 3,
  
  -- Risk factors
  risk_factors TEXT, -- JSON array of detected risks
  risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  
  -- Role recommendations
  recommended_roles TEXT, -- JSON array of required roles (frontend, backend, etc.)
  
  -- Success criteria (auto-generated)
  success_criteria TEXT, -- JSON array of completion criteria
  
  -- AI model and version info
  ai_model_used TEXT DEFAULT 'gpt-4',
  ai_confidence_score DECIMAL(5, 2) DEFAULT 0.00,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 2. Feature Breakdown Details
CREATE TABLE IF NOT EXISTS ai_feature_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  estimation_id INTEGER NOT NULL,
  
  feature_name TEXT NOT NULL,
  feature_description TEXT,
  feature_category TEXT, -- frontend, backend, database, integration, etc.
  
  -- Complexity analysis
  complexity_level TEXT DEFAULT 'medium' CHECK (complexity_level IN ('low', 'medium', 'high')),
  estimated_hours DECIMAL(8, 2) DEFAULT 0.00,
  
  -- Dependencies
  dependencies TEXT, -- JSON array of dependency feature IDs
  
  -- Priority
  priority INTEGER DEFAULT 2, -- 1: high, 2: medium, 3: low
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (estimation_id) REFERENCES ai_estimations(id) ON DELETE CASCADE
);

-- 3. Risk Analysis Details
CREATE TABLE IF NOT EXISTS ai_risk_analysis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  estimation_id INTEGER NOT NULL,
  
  risk_category TEXT NOT NULL, -- technical, schedule, budget, communication, quality
  risk_title TEXT NOT NULL,
  risk_description TEXT,
  
  -- Risk metrics
  probability TEXT DEFAULT 'medium',
  impact TEXT DEFAULT 'medium',
  risk_score INTEGER DEFAULT 5,
  
  -- Mitigation
  mitigation_strategy TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (estimation_id) REFERENCES ai_estimations(id) ON DELETE CASCADE
);

-- 4. Developer Proposal with AI Comparison
CREATE TABLE IF NOT EXISTS ai_proposal_comparison (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bid_id INTEGER NOT NULL,
  estimation_id INTEGER NOT NULL,
  
  -- Deviation from AI estimation
  timeline_deviation_days INTEGER DEFAULT 0, -- positive means longer, negative means shorter
  budget_deviation_usdt DECIMAL(12, 2) DEFAULT 0.00,
  
  -- Deviation percentage
  timeline_deviation_pct DECIMAL(5, 2) DEFAULT 0.00,
  budget_deviation_pct DECIMAL(5, 2) DEFAULT 0.00,
  
  -- Alert flags
  is_timeline_suspicious BOOLEAN DEFAULT 0,
  is_budget_suspicious BOOLEAN DEFAULT 0,
  
  -- Alert reason
  alert_reason TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (bid_id) REFERENCES bids(id) ON DELETE CASCADE,
  FOREIGN KEY (estimation_id) REFERENCES ai_estimations(id) ON DELETE CASCADE
);

-- 5. Historical Accuracy Tracking (for AI model improvement)
CREATE TABLE IF NOT EXISTS ai_estimation_accuracy (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  estimation_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  
  -- Actual vs Estimated
  actual_completion_days INTEGER,
  actual_budget_usdt DECIMAL(12, 2),
  
  -- Accuracy metrics
  timeline_accuracy_pct DECIMAL(5, 2), -- 100% = perfect, <100% = underestimated, >100% = overestimated
  budget_accuracy_pct DECIMAL(5, 2),
  
  -- Feedback
  client_satisfaction_score INTEGER,
  freelancer_satisfaction_score INTEGER,
  
  -- Notes
  deviation_reasons TEXT, -- JSON array of reasons for deviations
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (estimation_id) REFERENCES ai_estimations(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Note: Indexes will be created in a separate migration file due to wrangler limitations
