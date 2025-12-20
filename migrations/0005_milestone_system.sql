-- Milestone Management System Migration
-- This migration adds comprehensive milestone-based project management features

-- 1. Project Milestones
CREATE TABLE IF NOT EXISTS milestones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  contract_id INTEGER,
  
  -- Milestone details
  milestone_name TEXT NOT NULL,
  milestone_description TEXT,
  milestone_order INTEGER NOT NULL, -- 1, 2, 3, etc.
  
  -- Phase type (planning, development, testing, deployment)
  phase_type TEXT NOT NULL CHECK (phase_type IN ('planning', 'development', 'testing', 'deployment', 'other')),
  
  -- Timeline
  estimated_start_date DATE,
  estimated_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  
  -- Budget allocation (percentage of total project budget)
  budget_percentage DECIMAL(5, 2) DEFAULT 0.00,
  budget_amount_usdt DECIMAL(12, 2) DEFAULT 0.00,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'approved', 'rejected', 'completed')),
  
  -- Deliverables
  deliverable_description TEXT,
  deliverable_files TEXT, -- JSON array of file URLs
  git_repository_url TEXT,
  test_server_url TEXT,
  
  -- Success criteria checklist
  success_criteria TEXT, -- JSON array of completion criteria
  criteria_completion_pct DECIMAL(5, 2) DEFAULT 0.00,
  
  -- Approval tracking
  client_approval_status TEXT DEFAULT 'pending' CHECK (client_approval_status IN ('pending', 'approved', 'rejected', 'revision_requested')),
  client_approval_date DATETIME,
  client_feedback TEXT,
  
  -- Delay tracking
  is_delayed BOOLEAN DEFAULT 0,
  delay_days INTEGER DEFAULT 0,
  delay_reason TEXT,
  
  -- Payment trigger
  is_payment_released BOOLEAN DEFAULT 0,
  payment_release_date DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE SET NULL
);

-- 2. Milestone Tasks (sub-tasks within each milestone)
CREATE TABLE IF NOT EXISTS milestone_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  milestone_id INTEGER NOT NULL,
  
  -- Task details
  task_name TEXT NOT NULL,
  task_description TEXT,
  task_order INTEGER NOT NULL,
  
  -- Assignment
  assigned_to_user_id INTEGER, -- freelancer who will complete this task
  
  -- Timeline
  estimated_hours DECIMAL(8, 2) DEFAULT 0.00,
  actual_hours DECIMAL(8, 2) DEFAULT 0.00,
  due_date DATE,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  
  -- Deliverables
  deliverable_url TEXT,
  notes TEXT,
  
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Milestone Escrow Transactions
CREATE TABLE IF NOT EXISTS milestone_escrows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  milestone_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  contract_id INTEGER NOT NULL,
  
  -- Escrow amount (for this milestone)
  escrow_amount_usdt DECIMAL(12, 2) NOT NULL,
  
  -- Transaction info
  transaction_hash TEXT, -- USDT blockchain transaction hash
  
  -- Escrow status
  escrow_status TEXT DEFAULT 'pending' CHECK (escrow_status IN ('pending', 'locked', 'released', 'refunded', 'disputed')),
  
  -- Timeline
  locked_at DATETIME,
  released_at DATETIME,
  refunded_at DATETIME,
  
  -- Release conditions
  auto_release_date DATE, -- auto-release if client doesn't respond
  manual_release_by_user_id INTEGER, -- admin or client who manually released
  
  -- Refund info
  refund_reason TEXT,
  refund_percentage DECIMAL(5, 2) DEFAULT 0.00,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
  FOREIGN KEY (manual_release_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Milestone Review and Feedback
CREATE TABLE IF NOT EXISTS milestone_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  milestone_id INTEGER NOT NULL,
  reviewer_user_id INTEGER NOT NULL, -- client or admin
  
  -- Review details
  review_type TEXT NOT NULL CHECK (review_type IN ('client_review', 'admin_review', 'peer_review')),
  
  -- Rating (1-5 stars)
  quality_rating INTEGER,
  timeline_rating INTEGER,
  communication_rating INTEGER,
  
  -- Feedback
  positive_feedback TEXT,
  negative_feedback TEXT,
  improvement_suggestions TEXT,
  
  -- Decision
  approval_decision TEXT NOT NULL CHECK (approval_decision IN ('approved', 'rejected', 'revision_requested')),
  revision_requirements TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Milestone Delay Alerts
CREATE TABLE IF NOT EXISTS milestone_delay_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  milestone_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  
  -- Alert type
  alert_type TEXT NOT NULL CHECK (alert_type IN ('approaching_deadline', 'deadline_missed', 'no_progress', 'client_unresponsive')),
  alert_severity TEXT DEFAULT 'medium' CHECK (alert_severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Alert details
  alert_message TEXT NOT NULL,
  alert_details TEXT, -- JSON with detailed info
  
  -- Notification status
  notification_sent BOOLEAN DEFAULT 0,
  notification_sent_to TEXT, -- JSON array of user IDs notified
  notification_sent_at DATETIME,
  
  -- Resolution
  is_resolved BOOLEAN DEFAULT 0,
  resolved_at DATETIME,
  resolved_by_user_id INTEGER,
  resolution_notes TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (resolved_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 6. Milestone Change Logs
CREATE TABLE IF NOT EXISTS milestone_change_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  milestone_id INTEGER NOT NULL,
  changed_by_user_id INTEGER NOT NULL,
  
  -- Change type
  change_type TEXT NOT NULL CHECK (change_type IN ('status_change', 'deadline_change', 'budget_change', 'scope_change', 'approval_change', 'other')),
  
  -- Change details
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  
  -- Reason and approval
  change_reason TEXT,
  requires_client_approval BOOLEAN DEFAULT 0,
  client_approved BOOLEAN DEFAULT 0,
  client_approval_date DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Note: Indexes will be created in a separate migration file due to wrangler limitations
