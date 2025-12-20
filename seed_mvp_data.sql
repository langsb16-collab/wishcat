-- FeeZero Platform MVP Sample Data
-- Announcements and Dispute Rules

-- ===========================
-- Sample Announcements
-- ===========================
INSERT OR IGNORE INTO announcements (id, title, content, announcement_type, target_audience, priority, is_active) VALUES
(1, 'Welcome to FeeZero!', 'FeeZero platform is now live! Enjoy the lowest fees in the industry.', 'general', 'all', 2, 1),
(2, 'AI Estimation Feature Released', 'Now you can get instant project estimates using our AI-powered system.', 'feature', 'clients', 1, 1),
(3, 'Milestone-based Payment Available', 'Protect your project with our secure milestone payment system.', 'feature', 'all', 1, 1);

-- ===========================
-- Announcement Translations (Korean)
-- ===========================
INSERT OR IGNORE INTO announcement_translations (announcement_id, language, title, content) VALUES
(1, 'ko', 'FeeZero에 오신 것을 환영합니다!', 'FeeZero 플랫폼이 정식 오픈했습니다! 업계 최저 수수료를 경험하세요.'),
(2, 'ko', 'AI 견적 기능 출시', '이제 AI 기반 시스템으로 프로젝트 견적을 즉시 받아보실 수 있습니다.'),
(3, 'ko', '마일스톤 기반 결제 서비스 제공', '안전한 마일스톤 결제 시스템으로 프로젝트를 보호하세요.');

-- ===========================
-- Announcement Translations (English)
-- ===========================
INSERT OR IGNORE INTO announcement_translations (announcement_id, language, title, content) VALUES
(1, 'en', 'Welcome to FeeZero!', 'FeeZero platform is now live! Enjoy the lowest fees in the industry.'),
(2, 'en', 'AI Estimation Feature Released', 'Now you can get instant project estimates using our AI-powered system.'),
(3, 'en', 'Milestone-based Payment Available', 'Protect your project with our secure milestone payment system.');

-- ===========================
-- Announcement Translations (Chinese)
-- ===========================
INSERT OR IGNORE INTO announcement_translations (announcement_id, language, title, content) VALUES
(1, 'zh', '欢迎来到FeeZero！', 'FeeZero平台现已上线！享受业界最低的费用。'),
(2, 'zh', 'AI估算功能发布', '现在您可以使用我们的AI系统立即获得项目估算。'),
(3, 'zh', '里程碑付款可用', '使用我们安全的里程碑支付系统保护您的项目。');

-- ===========================
-- Announcement Translations (Japanese)
-- ===========================
INSERT OR IGNORE INTO announcement_translations (announcement_id, language, title, content) VALUES
(1, 'ja', 'FeeZeroへようこそ！', 'FeeZeroプラットフォームが正式オープンしました！業界最低の手数料をお楽しみください。'),
(2, 'ja', 'AI見積機能リリース', 'AIベースのシステムで即座にプロジェクト見積もりを取得できるようになりました。'),
(3, 'ja', 'マイルストーンベースの支払いが利用可能', '安全なマイルストーン支払いシステムでプロジェクトを保護してください。');

-- ===========================
-- Announcement Translations (Vietnamese)
-- ===========================
INSERT OR IGNORE INTO announcement_translations (announcement_id, language, title, content) VALUES
(1, 'vi', 'Chào mừng đến với FeeZero!', 'Nền tảng FeeZero hiện đã ra mắt! Tận hưởng mức phí thấp nhất trong ngành.'),
(2, 'vi', 'Tính năng Ước tính AI được phát hành', 'Bây giờ bạn có thể nhận được ước tính dự án ngay lập tức bằng hệ thống AI của chúng tôi.'),
(3, 'vi', 'Thanh toán dựa trên Mốc quan trọng', 'Bảo vệ dự án của bạn với hệ thống thanh toán mốc quan trọng an toàn của chúng tôi.');

-- ===========================
-- Announcement Translations (Thai)
-- ===========================
INSERT OR IGNORE INTO announcement_translations (announcement_id, language, title, content) VALUES
(1, 'th', 'ยินดีต้อนรับสู่ FeeZero!', 'แพลตฟอร์ม FeeZero เปิดให้บริการแล้ว! เพลิดเพลินกับค่าธรรมเนียมที่ต่ำที่สุดในอุตสาหกรรม'),
(2, 'th', 'ฟีเจอร์ประมาณการ AI เปิดตัวแล้ว', 'ตอนนี้คุณสามารถรับการประมาณการโครงการทันทีโดยใช้ระบบ AI ของเรา'),
(3, 'th', 'การชำระเงินแบบไมล์สโตนพร้อมใช้งาน', 'ปกป้องโครงการของคุณด้วยระบบการชำระเงินไมล์สโตนที่ปลอดภัย');

-- ===========================
-- Announcement Translations (Spanish)
-- ===========================
INSERT OR IGNORE INTO announcement_translations (announcement_id, language, title, content) VALUES
(1, 'es', '¡Bienvenido a FeeZero!', '¡La plataforma FeeZero ya está en vivo! Disfruta de las tarifas más bajas de la industria.'),
(2, 'es', 'Función de estimación AI lanzada', 'Ahora puede obtener estimaciones de proyectos instantáneas utilizando nuestro sistema AI.'),
(3, 'es', 'Pago basado en hitos disponible', 'Proteja su proyecto con nuestro sistema seguro de pago por hitos.');

-- ===========================
-- Announcement Translations (German)
-- ===========================
INSERT OR IGNORE INTO announcement_translations (announcement_id, language, title, content) VALUES
(1, 'de', 'Willkommen bei FeeZero!', 'Die FeeZero-Plattform ist jetzt live! Genießen Sie die niedrigsten Gebühren der Branche.'),
(2, 'de', 'KI-Schätzfunktion veröffentlicht', 'Jetzt können Sie sofort Projektschätzungen mit unserem KI-System erhalten.'),
(3, 'de', 'Meilensteinbasierte Zahlung verfügbar', 'Schützen Sie Ihr Projekt mit unserem sicheren Meilenstein-Zahlungssystem.');

-- ===========================
-- Dispute Resolution Rules
-- ===========================
INSERT OR IGNORE INTO dispute_rules (rule_name, condition_type, condition_params, action_type, action_params) VALUES
-- Rule 1: 마일스톤 미제출 (7일 초과)
('Milestone Not Submitted After 7 Days', 'milestone_not_submitted', '{"days": 7}', 'warning', '{"notify_admin": true, "send_warning": true}'),

-- Rule 2: 마일스톤 미제출 (14일 초과) - 부분 환불
('Milestone Not Submitted After 14 Days', 'milestone_not_submitted', '{"days": 14}', 'partial_refund', '{"refund_percentage": 50, "to": "client"}'),

-- Rule 3: 일정 지연 (7일 이상)
('Schedule Delay Over 7 Days', 'delay', '{"days": 7}', 'penalty', '{"penalty_percentage": 5, "max_amount": 100}'),

-- Rule 4: 일정 지연 (14일 이상) - 높은 패널티
('Schedule Delay Over 14 Days', 'delay', '{"days": 14}', 'penalty', '{"penalty_percentage": 10, "max_amount": 300}'),

-- Rule 5: 품질 이슈 (클라이언트 3회 반려)
('Quality Issue - 3 Rejections', 'quality_issue', '{"rejection_count": 3}', 'manual_review', '{"escalate_to_admin": true}'),

-- Rule 6: 커뮤니케이션 단절 (5일 무응답)
('No Response for 5 Days', 'no_response', '{"days": 5}', 'warning', '{"send_warning": true, "notify_admin": true}'),

-- Rule 7: 커뮤니케이션 단절 (10일 무응답) - 계약 해지
('No Response for 10 Days', 'no_response', '{"days": 10}', 'full_refund', '{"to": "client", "contract_status": "cancelled"}');
