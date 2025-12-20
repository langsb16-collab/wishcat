-- FeeZero Platform MVP Features
-- AI Estimation, Milestones, Success Criteria, Trust Score Enhancement
-- Version: 2.0
-- Date: 2025-12-10

-- ===========================
-- AI Project Estimation
-- ===========================
CREATE TABLE IF NOT EXISTS ai_estimations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER,
  user_id INTEGER NOT NULL,
  requirements_text TEXT NOT NULL,
  parsed_features TEXT, -- JSON: 분해된 기능 목록
  tech_stack_recommended TEXT, -- JSON: 추천 기술 스택
  difficulty_score INTEGER CHECK(difficulty_score >= 1 AND difficulty_score <= 5),
  estimated_days_min INTEGER,
  estimated_days_max INTEGER,
  estimated_cost_min DECIMAL(10, 2),
  estimated_cost_max DECIMAL(10, 2),
  risk_factors TEXT, -- JSON: 리스크 요소
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===========================
-- Project Success Criteria (계약서 자동 생성)
-- ===========================
CREATE TABLE IF NOT EXISTS success_criteria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL UNIQUE,
  criteria_items TEXT NOT NULL, -- JSON: 체크리스트 형식
  completion_conditions TEXT, -- JSON: 각 기능별 완료 조건
  ui_included INTEGER DEFAULT 0,
  testing_required INTEGER DEFAULT 1,
  documentation_required INTEGER DEFAULT 1,
  handover_scope TEXT, -- JSON: 인수인계 범위
  acceptance_criteria TEXT, -- JSON: 인수 기준
  agreed_by_client INTEGER DEFAULT 0,
  agreed_by_freelancer INTEGER DEFAULT 0,
  agreed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- ===========================
-- Milestones (단계별 관리)
-- ===========================
CREATE TABLE IF NOT EXISTS milestones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id INTEGER NOT NULL,
  sequence_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  deliverables TEXT, -- JSON: 산출물 목록
  estimated_days INTEGER,
  payment_percentage DECIMAL(5, 2), -- 해당 마일스톤 지급 비율
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'submitted', 'approved', 'rejected')),
  start_date DATETIME,
  due_date DATETIME,
  submitted_date DATETIME,
  approved_date DATETIME,
  submission_url TEXT,
  submission_files TEXT, -- JSON: 제출 파일 URL 목록
  client_feedback TEXT,
  is_delayed INTEGER DEFAULT 0,
  delay_days INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
);

-- ===========================
-- Escrow Payments (에스크로 단계별 결제)
-- ===========================
CREATE TABLE IF NOT EXISTS escrow_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id INTEGER NOT NULL,
  milestone_id INTEGER,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'locked', 'released', 'refunded', 'disputed')),
  locked_at DATETIME,
  released_at DATETIME,
  released_to_id INTEGER, -- freelancer_id
  refunded_at DATETIME,
  refunded_to_id INTEGER, -- client_id
  txn_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
  FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE SET NULL,
  FOREIGN KEY (released_to_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (refunded_to_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ===========================
-- Freelancer Trust Score (신뢰 점수 상세)
-- ===========================
CREATE TABLE IF NOT EXISTS trust_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  freelancer_id INTEGER NOT NULL UNIQUE,
  total_score DECIMAL(5, 2) DEFAULT 0.00, -- 0-100점
  completion_rate DECIMAL(5, 2) DEFAULT 0.00, -- 완료율
  on_time_rate DECIMAL(5, 2) DEFAULT 0.00, -- 일정 준수율
  re_hire_rate DECIMAL(5, 2) DEFAULT 0.00, -- 재의뢰율
  dispute_rate DECIMAL(5, 2) DEFAULT 0.00, -- 분쟁 발생률 (역수)
  quality_score DECIMAL(5, 2) DEFAULT 0.00, -- 품질 점수
  communication_score DECIMAL(5, 2) DEFAULT 0.00, -- 커뮤니케이션 점수
  last_calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (freelancer_id) REFERENCES freelancer_profiles(id) ON DELETE CASCADE
);

-- ===========================
-- Automated Dispute Resolution (자동 분쟁 해결)
-- ===========================
CREATE TABLE IF NOT EXISTS dispute_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_name TEXT NOT NULL,
  condition_type TEXT NOT NULL, -- 'milestone_not_submitted', 'quality_issue', 'delay', etc.
  condition_params TEXT, -- JSON: 조건 파라미터
  action_type TEXT NOT NULL, -- 'partial_refund', 'full_refund', 'penalty', 'warning'
  action_params TEXT, -- JSON: 액션 파라미터
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dispute_resolutions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dispute_id INTEGER NOT NULL,
  rule_id INTEGER,
  resolution_type TEXT NOT NULL, -- 'auto', 'manual'
  resolution_action TEXT NOT NULL,
  resolution_amount DECIMAL(10, 2),
  resolution_notes TEXT,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dispute_id) REFERENCES disputes(id) ON DELETE CASCADE,
  FOREIGN KEY (rule_id) REFERENCES dispute_rules(id) ON DELETE SET NULL
);

-- ===========================
-- Project Risk Monitoring (리스크 모니터링)
-- ===========================
CREATE TABLE IF NOT EXISTS project_risks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  contract_id INTEGER,
  risk_type TEXT NOT NULL, -- 'delay', 'no_response', 'quality', 'scope_creep'
  risk_level TEXT NOT NULL CHECK(risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_score INTEGER, -- 0-100
  detected_reason TEXT,
  detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved INTEGER DEFAULT 0,
  resolved_at DATETIME,
  admin_notified INTEGER DEFAULT 0,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
);

-- ===========================
-- Delay Penalties (일정 지연 패널티)
-- ===========================
CREATE TABLE IF NOT EXISTS delay_penalties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id INTEGER NOT NULL,
  milestone_id INTEGER,
  delay_days INTEGER NOT NULL,
  penalty_percentage DECIMAL(5, 2), -- 패널티 비율
  penalty_amount DECIMAL(10, 2),
  status TEXT NOT NULL DEFAULT 'calculated' CHECK(status IN ('calculated', 'applied', 'waived')),
  waived_reason TEXT,
  applied_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
  FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE
);

-- ===========================
-- Platform Announcements (공지사항)
-- ===========================
CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  announcement_type TEXT CHECK(announcement_type IN ('general', 'maintenance', 'feature', 'promotion')),
  target_audience TEXT DEFAULT 'all', -- 'all', 'clients', 'freelancers'
  priority INTEGER DEFAULT 0, -- 0: normal, 1: important, 2: urgent
  is_active INTEGER DEFAULT 1,
  start_date DATETIME,
  end_date DATETIME,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS announcement_translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  announcement_id INTEGER NOT NULL,
  language TEXT NOT NULL CHECK(language IN ('ko', 'en', 'zh', 'ja', 'vi', 'th', 'es', 'de')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  UNIQUE(announcement_id, language),
  FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE
);

-- ===========================
-- Indexes for Performance
-- ===========================
CREATE INDEX IF NOT EXISTS idx_ai_estimations_project_id ON ai_estimations(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_estimations_user_id ON ai_estimations(user_id);
CREATE INDEX IF NOT EXISTS idx_success_criteria_project_id ON success_criteria(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_contract_id ON milestones(contract_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON milestones(status);
CREATE INDEX IF NOT EXISTS idx_escrow_payments_contract_id ON escrow_payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_escrow_payments_milestone_id ON escrow_payments(milestone_id);
CREATE INDEX IF NOT EXISTS idx_trust_scores_freelancer_id ON trust_scores(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_project_risks_project_id ON project_risks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_risks_risk_level ON project_risks(risk_level);
CREATE INDEX IF NOT EXISTS idx_delay_penalties_contract_id ON delay_penalties(contract_id);
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);
