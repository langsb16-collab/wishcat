-- Simplified MVP sample data using existing table structures
PRAGMA foreign_keys = OFF;

-- 1. Sample AI Estimation for Project ID 1
INSERT OR IGNORE INTO ai_estimations (
  id, project_id, user_id, requirements_text, parsed_features, 
  tech_stack_recommended, difficulty_score,
  estimated_days_min, estimated_days_max,
  estimated_cost_min, estimated_cost_max,
  risk_factors
) VALUES (
  1, 1, 2,
  'E-commerce platform with user authentication, product listing, shopping cart, and payment integration',
  json('[
    "User Authentication (Login/Signup)",
    "Product Catalog with Filters",
    "Shopping Cart Management",
    "Payment Gateway Integration",
    "Order Tracking System",
    "Admin Dashboard"
  ]'),
  json('["React","Node.js","Express","PostgreSQL","Stripe API"]'),
  4,
  30, 60,
  5000.00, 10000.00,
  json('[
    "Payment Gateway Integration Complexity",
    "Third-party API Dependencies",
    "Security Requirements for Payment Handling"
  ]')
);

-- 2. Sample Milestones for Project ID 1
INSERT OR IGNORE INTO milestones (
  id, project_id, milestone_name, milestone_description, milestone_order, phase_type,
  estimated_start_date, estimated_end_date,
  budget_percentage, budget_amount_usdt, status,
  success_criteria
) VALUES
(1, 1, 'Planning & Design', 'Requirements gathering, UI/UX design, technical architecture', 1, 'planning',
 date('now'), date('now', '+7 days'),
 15.00, 1125.00, 'completed',
 json('[
   "Requirements document approved",
   "UI/UX designs completed",
   "Database schema designed",
   "API endpoints defined"
 ]')),
(2, 1, 'Core Development', 'User authentication, product catalog, shopping cart implementation', 2, 'development',
 date('now', '+7 days'), date('now', '+28 days'),
 40.00, 3000.00, 'in_progress',
 json('[
   "User registration and login working",
   "Product listing and detail pages completed",
   "Shopping cart functionality implemented",
   "Backend APIs tested"
 ]')),
(3, 1, 'Payment Integration', 'Stripe payment gateway integration and testing', 3, 'development',
 date('now', '+28 days'), date('now', '+35 days'),
 25.00, 1875.00, 'pending',
 json('[
   "Stripe account setup and verified",
   "Payment flow integrated",
   "Test transactions successful",
   "Error handling implemented"
 ]')),
(4, 1, 'Testing & Deployment', 'QA testing, bug fixes, deployment to production', 4, 'testing',
 date('now', '+35 days'), date('now', '+45 days'),
 20.00, 1500.00, 'pending',
 json('[
   "All test cases passed",
   "Performance testing completed",
   "Security audit passed",
   "Production deployment successful"
 ]'));

-- 3. Sample Milestone Tasks
INSERT OR IGNORE INTO milestone_tasks (id, milestone_id, task_name, task_description, task_order, estimated_hours, status) VALUES
(1, 2, 'User Authentication Frontend', 'Build registration and login forms', 1, 16.00, 'completed'),
(2, 2, 'User Authentication Backend', 'API endpoints for auth with JWT', 2, 12.00, 'completed'),
(3, 2, 'Product Listing Page', 'Display products with filters and search', 3, 20.00, 'in_progress'),
(4, 2, 'Shopping Cart UI', 'Cart page with add/remove/update functions', 4, 16.00, 'pending'),
(5, 2, 'Shopping Cart API', 'Backend cart management', 5, 16.00, 'pending');

-- 4. Sample Milestone Escrows (contract_id is optional for now)
INSERT OR IGNORE INTO milestone_escrows (id, milestone_id, project_id, contract_id, escrow_amount_usdt, escrow_status, locked_at) VALUES
(1, 1, 1, NULL, 1125.00, 'released', datetime('now', '-5 days')),
(2, 2, 1, NULL, 3000.00, 'locked', datetime('now', '-2 days')),
(3, 3, 1, NULL, 1875.00, 'pending', NULL),
(4, 4, 1, NULL, 1500.00, 'pending', NULL);

-- 5. Sample Milestone Reviews
INSERT OR IGNORE INTO milestone_reviews (id, milestone_id, reviewer_user_id, review_type, quality_rating, timeline_rating, communication_rating, positive_feedback, approval_decision) VALUES
(1, 1, 1, 'client_review', 5, 5, 5, 'Excellent planning phase. Clear requirements and beautiful designs.', 'approved');

-- 6. Sample Delay Alerts
INSERT OR IGNORE INTO milestone_delay_alerts (id, milestone_id, project_id, alert_type, alert_severity, alert_message, notification_sent) VALUES
(1, 2, 1, 'approaching_deadline', 'medium', 'Milestone "Core Development" is approaching deadline in 3 days', 0);

-- 7. Sample Trust Scores
UPDATE trust_scores SET
  completion_rate = 95.5,
  schedule_adherence_rate = 90.0,
  rehire_rate = 85.0,
  dispute_rate = 2.5,
  quality_score = 4.5,
  communication_score = 4.8
WHERE user_id = 2;

PRAGMA foreign_keys = ON;
