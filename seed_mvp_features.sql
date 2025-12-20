-- Sample data for AI Estimation and Milestone features

-- 1. Sample AI Estimation for Project ID 1
INSERT OR IGNORE INTO ai_estimations (
  id, project_id, raw_requirements, feature_count, feature_list, 
  tech_stack, tech_stack_difficulty_score,
  estimated_days_min, estimated_days_appropriate, estimated_days_max,
  estimated_budget_min, estimated_budget_appropriate, estimated_budget_max,
  overall_difficulty_score, risk_factors, risk_level,
  recommended_roles, success_criteria,
  ai_model_used, ai_confidence_score
) VALUES (
  1, 1, 
  'E-commerce platform with user authentication, product listing, shopping cart, and payment integration',
  12,
  json('[
    {"id":1,"name":"User Authentication","description":"Login/Signup with email and social login"},
    {"id":2,"name":"Product Catalog","description":"Browse and search products with filters"},
    {"id":3,"name":"Shopping Cart","description":"Add/remove products, update quantities"},
    {"id":4,"name":"Payment Processing","description":"Integrate payment gateway (Stripe/PayPal)"},
    {"id":5,"name":"Order Management","description":"Track orders, order history"},
    {"id":6,"name":"Admin Dashboard","description":"Manage products, orders, users"}
  ]'),
  json('["React","Node.js","Express","PostgreSQL","Stripe API"]'),
  4,
  30, 45, 60,
  5000.00, 7500.00, 10000.00,
  4,
  json('[
    {"type":"technical","title":"Payment Gateway Integration Complexity"},
    {"type":"schedule","title":"Third-party API Dependencies"},
    {"type":"quality","title":"Security Requirements for Payment Handling"}
  ]'),
  'high',
  json('["Frontend Developer","Backend Developer","UI/UX Designer","QA Engineer"]'),
  json('[
    {"criteria":"All user stories completed and tested"},
    {"criteria":"Payment integration working with test transactions"},
    {"criteria":"Admin panel fully functional"},
    {"criteria":"Security audit passed"},
    {"criteria":"Performance testing completed (load time < 3s)"}
  ]'),
  'gpt-4',
  85.50
);

-- 2. Sample AI Feature Items
INSERT OR IGNORE INTO ai_feature_items (id, estimation_id, feature_name, feature_description, feature_category, complexity_level, estimated_hours, priority) VALUES
(1, 1, 'User Registration', 'Email/password registration with verification', 'frontend', 'medium', 16.00, 1),
(2, 1, 'User Login', 'Login with JWT token authentication', 'backend', 'medium', 12.00, 1),
(3, 1, 'Product Listing Page', 'Display products with pagination and filters', 'frontend', 'medium', 20.00, 1),
(4, 1, 'Product Detail Page', 'Show detailed product information with images', 'frontend', 'low', 12.00, 2),
(5, 1, 'Shopping Cart API', 'Backend API for cart operations', 'backend', 'medium', 16.00, 1),
(6, 1, 'Stripe Payment Integration', 'Integrate Stripe checkout', 'backend', 'high', 32.00, 1),
(7, 1, 'Order Tracking', 'Order status and history tracking', 'backend', 'medium', 20.00, 2),
(8, 1, 'Admin Product Management', 'CRUD operations for products', 'backend', 'medium', 24.00, 2);

-- 3. Sample Risk Analysis
INSERT OR IGNORE INTO ai_risk_analysis (id, estimation_id, risk_category, risk_title, risk_description, probability, impact, risk_score, mitigation_strategy) VALUES
(1, 1, 'technical', 'Payment Gateway Integration', 'Stripe API integration may require additional security measures and testing', 'medium', 'high', 7, 'Start with sandbox environment, conduct thorough security testing'),
(2, 1, 'schedule', 'Third-party Dependencies', 'Delays in payment gateway approval process', 'medium', 'medium', 5, 'Apply for payment gateway account early, have backup option'),
(3, 1, 'quality', 'Security Vulnerabilities', 'Handling sensitive payment information requires high security standards', 'low', 'high', 6, 'Implement industry-standard security practices, conduct security audit');

-- 4. Sample Milestones for Project ID 1
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
   {"item":"Requirements document approved"},
   {"item":"UI/UX designs completed"},
   {"item":"Database schema designed"},
   {"item":"API endpoints defined"}
 ]')),
(2, 1, 'Core Development', 'User authentication, product catalog, shopping cart implementation', 2, 'development',
 date('now', '+7 days'), date('now', '+28 days'),
 40.00, 3000.00, 'in_progress',
 json('[
   {"item":"User registration and login working"},
   {"item":"Product listing and detail pages completed"},
   {"item":"Shopping cart functionality implemented"},
   {"item":"Backend APIs tested"}
 ]')),
(3, 1, 'Payment Integration', 'Stripe payment gateway integration and testing', 3, 'development',
 date('now', '+28 days'), date('now', '+35 days'),
 25.00, 1875.00, 'pending',
 json('[
   {"item":"Stripe account setup and verified"},
   {"item":"Payment flow integrated"},
   {"item":"Test transactions successful"},
   {"item":"Error handling implemented"}
 ]')),
(4, 1, 'Testing & Deployment', 'QA testing, bug fixes, deployment to production', 4, 'testing',
 date('now', '+35 days'), date('now', '+45 days'),
 20.00, 1500.00, 'pending',
 json('[
   {"item":"All test cases passed"},
   {"item":"Performance testing completed"},
   {"item":"Security audit passed"},
   {"item":"Production deployment successful"}
 ]'));

-- 5. Sample Milestone Tasks
INSERT OR IGNORE INTO milestone_tasks (id, milestone_id, task_name, task_description, task_order, estimated_hours, status) VALUES
(1, 2, 'User Authentication Frontend', 'Build registration and login forms', 1, 16.00, 'completed'),
(2, 2, 'User Authentication Backend', 'API endpoints for auth with JWT', 2, 12.00, 'completed'),
(3, 2, 'Product Listing Page', 'Display products with filters and search', 3, 20.00, 'in_progress'),
(4, 2, 'Shopping Cart UI', 'Cart page with add/remove/update functions', 4, 16.00, 'pending'),
(5, 2, 'Shopping Cart API', 'Backend cart management', 5, 16.00, 'pending');

-- 6. Sample Milestone Escrow
INSERT OR IGNORE INTO milestone_escrows (id, milestone_id, project_id, contract_id, escrow_amount_usdt, escrow_status, locked_at) VALUES
(1, 1, 1, 1, 1125.00, 'released', datetime('now', '-5 days')),
(2, 2, 1, 1, 3000.00, 'locked', datetime('now', '-2 days')),
(3, 3, 1, 1, 1875.00, 'pending', NULL),
(4, 4, 1, 1, 1500.00, 'pending', NULL);

-- 7. Sample Milestone Review
INSERT OR IGNORE INTO milestone_reviews (id, milestone_id, reviewer_user_id, review_type, quality_rating, timeline_rating, communication_rating, positive_feedback, approval_decision) VALUES
(1, 1, 1, 'client_review', 5, 5, 5, 'Excellent planning phase. Clear requirements and beautiful designs.', 'approved');

-- 8. Sample Delay Alert
INSERT OR IGNORE INTO milestone_delay_alerts (id, milestone_id, project_id, alert_type, alert_severity, alert_message, notification_sent) VALUES
(1, 2, 1, 'approaching_deadline', 'medium', 'Milestone "Core Development" is approaching deadline in 3 days', 0);
