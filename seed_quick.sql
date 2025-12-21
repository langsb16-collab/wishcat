-- Quick sample data for testing
INSERT OR IGNORE INTO users (id, email, password_hash, full_name, nickname, phone_number, country, user_type, is_active) VALUES
(1, 'client1@test.com', 'dummy_hash', 'Client Kim', 'Client Kim', '+82-10-0000-0001', 'KR', 'client', 1),
(2, 'dev1@test.com', 'dummy_hash', 'Developer Lee', 'Dev Lee', '+82-10-0000-0002', 'KR', 'freelancer', 1),
(3, 'dev2@test.com', 'dummy_hash', 'Developer Park', 'Dev Park', '+1-555-0000-0003', 'US', 'freelancer', 1);

INSERT OR IGNORE INTO projects (id, client_id, title, description, budget_min, budget_max, status, is_urgent) VALUES
(1, 1, 'E-commerce Website Development', 'Need a modern e-commerce website with payment integration', 5000, 10000, 'open', 1),
(2, 1, 'Mobile App Development', 'iOS and Android app for food delivery', 8000, 15000, 'open', 0),
(3, 1, 'AI Chatbot Integration', 'Integrate AI chatbot into existing website', 3000, 6000, 'open', 1);

INSERT OR IGNORE INTO freelancer_profiles (id, user_id, bio, hourly_rate, average_rating, completed_projects) VALUES
(1, 2, 'Full-stack developer with 5+ years experience in React, Node.js, Python, AWS', 50, 4.8, 25),
(2, 3, 'Mobile app specialist - React Native, Swift, Kotlin, Firebase', 60, 4.9, 30);
