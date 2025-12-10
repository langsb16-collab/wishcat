-- FeeZero Platform Seed Data
-- Initial data for testing and development

-- ===========================
-- Categories (Main Categories)
-- ===========================
INSERT OR IGNORE INTO categories (id, parent_id, slug, icon, display_order, is_active) VALUES
-- Development & IT
(1, NULL, 'development-it', 'fa-code', 1, 1),
(2, 1, 'web-development', 'fa-globe', 1, 1),
(3, 1, 'mobile-app-development', 'fa-mobile-alt', 2, 1),
(4, 1, 'software-development', 'fa-laptop-code', 3, 1),
(5, 1, 'game-development', 'fa-gamepad', 4, 1),
(6, 1, 'database', 'fa-database', 5, 1),
(7, 1, 'ai-machine-learning', 'fa-brain', 6, 1),
(8, 1, 'blockchain', 'fa-link', 7, 1),
(9, 1, 'devops', 'fa-server', 8, 1),

-- Design
(10, NULL, 'design', 'fa-palette', 2, 1),
(11, 10, 'ui-ux-design', 'fa-pencil-ruler', 1, 1),
(12, 10, 'graphic-design', 'fa-paint-brush', 2, 1),
(13, 10, 'web-design', 'fa-desktop', 3, 1),
(14, 10, 'video-editing', 'fa-video', 4, 1),
(15, 10, '3d-modeling', 'fa-cube', 5, 1),
(16, 10, 'illustration', 'fa-image', 6, 1),

-- Marketing & Business
(17, NULL, 'marketing-business', 'fa-chart-line', 3, 1),
(18, 17, 'digital-marketing', 'fa-bullhorn', 1, 1),
(19, 17, 'content-marketing', 'fa-file-alt', 2, 1),
(20, 17, 'branding', 'fa-copyright', 3, 1),
(21, 17, 'market-research', 'fa-search', 4, 1),
(22, 17, 'business-consulting', 'fa-briefcase', 5, 1),

-- Writing & Translation
(23, NULL, 'writing-translation', 'fa-pen', 4, 1),
(24, 23, 'content-writing', 'fa-keyboard', 1, 1),
(25, 23, 'translation', 'fa-language', 2, 1),
(26, 23, 'copywriting', 'fa-ad', 3, 1),
(27, 23, 'technical-writing', 'fa-book', 4, 1),
(28, 23, 'legal-documents', 'fa-gavel', 5, 1),

-- Others
(29, NULL, 'others', 'fa-ellipsis-h', 5, 1),
(30, 29, 'data-entry', 'fa-table', 1, 1),
(31, 29, 'virtual-assistant', 'fa-user-tie', 2, 1),
(32, 29, 'legal-consultation', 'fa-balance-scale', 3, 1),
(33, 29, 'finance-accounting', 'fa-calculator', 4, 1);

-- ===========================
-- Category Translations (Korean)
-- ===========================
INSERT OR IGNORE INTO category_translations (category_id, language, name, description) VALUES
(1, 'ko', '개발 & IT', '웹, 앱, 소프트웨어 개발 및 IT 관련 서비스'),
(2, 'ko', '웹 개발', '홈페이지, 웹 애플리케이션 개발'),
(3, 'ko', '모바일 앱 개발', 'iOS, Android 네이티브/하이브리드 앱'),
(4, 'ko', '소프트웨어 개발', '데스크톱 프로그램, 시스템 개발'),
(5, 'ko', '게임 개발', '모바일, PC, 콘솔 게임'),
(6, 'ko', '데이터베이스', 'DB 설계, 구축, 관리'),
(7, 'ko', 'AI/머신러닝', '인공지능, 데이터 분석'),
(8, 'ko', '블록체인', '스마트 컨트랙트, NFT, DeFi'),
(9, 'ko', 'DevOps', 'CI/CD, 클라우드 인프라 구축'),
(10, 'ko', '디자인', 'UI/UX, 그래픽, 웹 디자인 등'),
(11, 'ko', 'UI/UX 디자인', '사용자 인터페이스 및 경험 설계'),
(12, 'ko', '그래픽 디자인', '로고, 브랜딩, 인쇄물'),
(13, 'ko', '웹 디자인', '반응형 웹사이트 디자인'),
(14, 'ko', '영상 편집', '동영상 제작, 모션 그래픽'),
(15, 'ko', '3D 모델링', '제품, 캐릭터, 건축 3D'),
(16, 'ko', '일러스트', '캐릭터, 배경, 콘셉트 아트'),
(17, 'ko', '마케팅 & 비즈니스', '디지털 마케팅, 브랜딩, 컨설팅'),
(18, 'ko', '디지털 마케팅', 'SEO, SEM, SNS 마케팅'),
(19, 'ko', '콘텐츠 마케팅', '블로그, 유튜브 콘텐츠 제작'),
(20, 'ko', '브랜딩', '브랜드 전략, CI/BI 개발'),
(21, 'ko', '시장 조사', '경쟁 분석, 소비자 리서치'),
(22, 'ko', '비즈니스 컨설팅', '사업 전략, 프로세스 개선'),
(23, 'ko', '글쓰기 & 번역', '콘텐츠 작성, 번역, 카피라이팅'),
(24, 'ko', '콘텐츠 작성', '블로그, 기사, 웹 콘텐츠'),
(25, 'ko', '번역', '다국어 문서 번역'),
(26, 'ko', '카피라이팅', '광고 문구, 마케팅 카피'),
(27, 'ko', '기술 문서 작성', '매뉴얼, API 문서'),
(28, 'ko', '법률 문서', '계약서, 이용약관 작성'),
(29, 'ko', '기타', '데이터 입력, 행정 업무 등'),
(30, 'ko', '데이터 입력', '문서 작업, 자료 정리'),
(31, 'ko', '가상 비서', '행정 업무 지원'),
(32, 'ko', '법률 자문', '계약, 지적재산권 상담'),
(33, 'ko', '재무/회계', '세무, 재무제표 작성');

-- ===========================
-- Category Translations (English)
-- ===========================
INSERT OR IGNORE INTO category_translations (category_id, language, name, description) VALUES
(1, 'en', 'Development & IT', 'Web, app, software development and IT services'),
(2, 'en', 'Web Development', 'Websites, web applications'),
(3, 'en', 'Mobile App Development', 'iOS, Android native/hybrid apps'),
(4, 'en', 'Software Development', 'Desktop programs, system development'),
(5, 'en', 'Game Development', 'Mobile, PC, console games'),
(6, 'en', 'Database', 'DB design, construction, management'),
(7, 'en', 'AI/Machine Learning', 'Artificial intelligence, data analysis'),
(8, 'en', 'Blockchain', 'Smart contracts, NFT, DeFi'),
(9, 'en', 'DevOps', 'CI/CD, cloud infrastructure'),
(10, 'en', 'Design', 'UI/UX, graphic, web design, etc.'),
(11, 'en', 'UI/UX Design', 'User interface and experience design'),
(12, 'en', 'Graphic Design', 'Logo, branding, print materials'),
(13, 'en', 'Web Design', 'Responsive website design'),
(14, 'en', 'Video Editing', 'Video production, motion graphics'),
(15, 'en', '3D Modeling', 'Product, character, architectural 3D'),
(16, 'en', 'Illustration', 'Character, background, concept art'),
(17, 'en', 'Marketing & Business', 'Digital marketing, branding, consulting'),
(18, 'en', 'Digital Marketing', 'SEO, SEM, social media marketing'),
(19, 'en', 'Content Marketing', 'Blog, YouTube content creation'),
(20, 'en', 'Branding', 'Brand strategy, CI/BI development'),
(21, 'en', 'Market Research', 'Competitive analysis, consumer research'),
(22, 'en', 'Business Consulting', 'Business strategy, process improvement'),
(23, 'en', 'Writing & Translation', 'Content writing, translation, copywriting'),
(24, 'en', 'Content Writing', 'Blog, articles, web content'),
(25, 'en', 'Translation', 'Multilingual document translation'),
(26, 'en', 'Copywriting', 'Ad copy, marketing copy'),
(27, 'en', 'Technical Writing', 'Manuals, API documentation'),
(28, 'en', 'Legal Documents', 'Contracts, terms of service'),
(29, 'en', 'Others', 'Data entry, administrative tasks, etc.'),
(30, 'en', 'Data Entry', 'Document work, data organization'),
(31, 'en', 'Virtual Assistant', 'Administrative support'),
(32, 'en', 'Legal Consultation', 'Contract, intellectual property advice'),
(33, 'en', 'Finance/Accounting', 'Tax, financial statement preparation');

-- ===========================
-- Category Translations (Chinese)
-- ===========================
INSERT OR IGNORE INTO category_translations (category_id, language, name, description) VALUES
(1, 'zh', '开发与IT', '网页、应用、软件开发及IT服务'),
(2, 'zh', '网页开发', '网站、网页应用开发'),
(3, 'zh', '移动应用开发', 'iOS、Android原生/混合应用'),
(4, 'zh', '软件开发', '桌面程序、系统开发'),
(5, 'zh', '游戏开发', '手机、PC、主机游戏'),
(6, 'zh', '数据库', '数据库设计、构建、管理'),
(7, 'zh', 'AI/机器学习', '人工智能、数据分析'),
(8, 'zh', '区块链', '智能合约、NFT、DeFi'),
(9, 'zh', 'DevOps', 'CI/CD、云基础设施构建'),
(10, 'zh', '设计', 'UI/UX、平面、网页设计等'),
(11, 'zh', 'UI/UX设计', '用户界面与体验设计'),
(12, 'zh', '平面设计', '标志、品牌、印刷品'),
(13, 'zh', '网页设计', '响应式网站设计'),
(14, 'zh', '视频编辑', '视频制作、动态图形'),
(15, 'zh', '3D建模', '产品、角色、建筑3D'),
(16, 'zh', '插画', '角色、背景、概念艺术'),
(17, 'zh', '营销与商务', '数字营销、品牌推广、咨询'),
(18, 'zh', '数字营销', 'SEO、SEM、社交媒体营销'),
(19, 'zh', '内容营销', '博客、YouTube内容创作'),
(20, 'zh', '品牌推广', '品牌战略、CI/BI开发'),
(21, 'zh', '市场调研', '竞争分析、消费者研究'),
(22, 'zh', '商务咨询', '商业战略、流程改进'),
(23, 'zh', '写作与翻译', '内容撰写、翻译、文案写作'),
(24, 'zh', '内容撰写', '博客、文章、网页内容'),
(25, 'zh', '翻译', '多语言文档翻译'),
(26, 'zh', '文案写作', '广告文案、营销文案'),
(27, 'zh', '技术文档', '手册、API文档'),
(28, 'zh', '法律文件', '合同、使用条款撰写'),
(29, 'zh', '其他', '数据录入、行政业务等'),
(30, 'zh', '数据录入', '文档工作、资料整理'),
(31, 'zh', '虚拟助理', '行政业务支持'),
(32, 'zh', '法律咨询', '合同、知识产权咨询'),
(33, 'zh', '财务/会计', '税务、财务报表编制');

-- ===========================
-- Category Translations (Japanese)
-- ===========================
INSERT OR IGNORE INTO category_translations (category_id, language, name, description) VALUES
(1, 'ja', '開発とIT', 'Web、アプリ、ソフトウェア開発とITサービス'),
(2, 'ja', 'Web開発', 'ホームページ、Webアプリケーション開発'),
(3, 'ja', 'モバイルアプリ開発', 'iOS、Androidネイティブ/ハイブリッドアプリ'),
(4, 'ja', 'ソフトウェア開発', 'デスクトッププログラム、システム開発'),
(5, 'ja', 'ゲーム開発', 'モバイル、PC、コンソールゲーム'),
(6, 'ja', 'データベース', 'DB設計、構築、管理'),
(7, 'ja', 'AI/機械学習', '人工知能、データ分析'),
(8, 'ja', 'ブロックチェーン', 'スマートコントラクト、NFT、DeFi'),
(9, 'ja', 'DevOps', 'CI/CD、クラウドインフラ構築'),
(10, 'ja', 'デザイン', 'UI/UX、グラフィック、Webデザインなど'),
(11, 'ja', 'UI/UXデザイン', 'ユーザーインターフェース・体験設計'),
(12, 'ja', 'グラフィックデザイン', 'ロゴ、ブランディング、印刷物'),
(13, 'ja', 'Webデザイン', 'レスポンシブWebサイトデザイン'),
(14, 'ja', '映像編集', '動画制作、モーショングラフィックス'),
(15, 'ja', '3Dモデリング', '製品、キャラクター、建築3D'),
(16, 'ja', 'イラスト', 'キャラクター、背景、コンセプトアート'),
(17, 'ja', 'マーケティングとビジネス', 'デジタルマーケティング、ブランディング、コンサルティング'),
(18, 'ja', 'デジタルマーケティング', 'SEO、SEM、SNSマーケティング'),
(19, 'ja', 'コンテンツマーケティング', 'ブログ、YouTubeコンテンツ制作'),
(20, 'ja', 'ブランディング', 'ブランド戦略、CI/BI開発'),
(21, 'ja', '市場調査', '競合分析、消費者リサーチ'),
(22, 'ja', 'ビジネスコンサルティング', '事業戦略、プロセス改善'),
(23, 'ja', 'ライティングと翻訳', 'コンテンツライティング、翻訳、コピーライティング'),
(24, 'ja', 'コンテンツライティング', 'ブログ、記事、Webコンテンツ'),
(25, 'ja', '翻訳', '多言語文書翻訳'),
(26, 'ja', 'コピーライティング', '広告文、マーケティングコピー'),
(27, 'ja', '技術文書作成', 'マニュアル、API文書'),
(28, 'ja', '法律文書', '契約書、利用規約作成'),
(29, 'ja', 'その他', 'データ入力、行政業務など'),
(30, 'ja', 'データ入力', '文書作業、資料整理'),
(31, 'ja', 'バーチャルアシスタント', '行政業務サポート'),
(32, 'ja', '法律相談', '契約、知的財産権相談'),
(33, 'ja', '財務/会計', '税務、財務諸表作成');

-- ===========================
-- Skills (Sample)
-- ===========================
INSERT OR IGNORE INTO skills (id, slug, category_id) VALUES
-- Programming Languages
(1, 'javascript', 2),
(2, 'typescript', 2),
(3, 'python', 4),
(4, 'java', 4),
(5, 'swift', 3),
(6, 'kotlin', 3),
(7, 'react', 2),
(8, 'vue', 2),
(9, 'angular', 2),
(10, 'nodejs', 2),

-- Design Tools
(11, 'figma', 11),
(12, 'adobe-xd', 11),
(13, 'photoshop', 12),
(14, 'illustrator', 12),
(15, 'after-effects', 14),
(16, 'blender', 15),

-- Marketing
(17, 'seo', 18),
(18, 'google-ads', 18),
(19, 'facebook-ads', 18),
(20, 'content-strategy', 19);

-- ===========================
-- Skill Translations
-- ===========================
INSERT OR IGNORE INTO skill_translations (skill_id, language, name) VALUES
-- Korean
(1, 'ko', 'JavaScript'),
(2, 'ko', 'TypeScript'),
(3, 'ko', 'Python'),
(4, 'ko', 'Java'),
(5, 'ko', 'Swift'),
(6, 'ko', 'Kotlin'),
(7, 'ko', 'React'),
(8, 'ko', 'Vue.js'),
(9, 'ko', 'Angular'),
(10, 'ko', 'Node.js'),
(11, 'ko', 'Figma'),
(12, 'ko', 'Adobe XD'),
(13, 'ko', 'Photoshop'),
(14, 'ko', 'Illustrator'),
(15, 'ko', 'After Effects'),
(16, 'ko', 'Blender'),
(17, 'ko', 'SEO'),
(18, 'ko', 'Google 광고'),
(19, 'ko', 'Facebook 광고'),
(20, 'ko', '콘텐츠 전략'),

-- English
(1, 'en', 'JavaScript'),
(2, 'en', 'TypeScript'),
(3, 'en', 'Python'),
(4, 'en', 'Java'),
(5, 'en', 'Swift'),
(6, 'en', 'Kotlin'),
(7, 'en', 'React'),
(8, 'en', 'Vue.js'),
(9, 'en', 'Angular'),
(10, 'en', 'Node.js'),
(11, 'en', 'Figma'),
(12, 'en', 'Adobe XD'),
(13, 'en', 'Photoshop'),
(14, 'en', 'Illustrator'),
(15, 'en', 'After Effects'),
(16, 'en', 'Blender'),
(17, 'en', 'SEO'),
(18, 'en', 'Google Ads'),
(19, 'en', 'Facebook Ads'),
(20, 'en', 'Content Strategy'),

-- Chinese
(1, 'zh', 'JavaScript'),
(2, 'zh', 'TypeScript'),
(3, 'zh', 'Python'),
(4, 'zh', 'Java'),
(5, 'zh', 'Swift'),
(6, 'zh', 'Kotlin'),
(7, 'zh', 'React'),
(8, 'zh', 'Vue.js'),
(9, 'zh', 'Angular'),
(10, 'zh', 'Node.js'),
(11, 'zh', 'Figma'),
(12, 'zh', 'Adobe XD'),
(13, 'zh', 'Photoshop'),
(14, 'zh', 'Illustrator'),
(15, 'zh', 'After Effects'),
(16, 'zh', 'Blender'),
(17, 'zh', 'SEO'),
(18, 'zh', 'Google广告'),
(19, 'zh', 'Facebook广告'),
(20, 'zh', '内容策略'),

-- Japanese
(1, 'ja', 'JavaScript'),
(2, 'ja', 'TypeScript'),
(3, 'ja', 'Python'),
(4, 'ja', 'Java'),
(5, 'ja', 'Swift'),
(6, 'ja', 'Kotlin'),
(7, 'ja', 'React'),
(8, 'ja', 'Vue.js'),
(9, 'ja', 'Angular'),
(10, 'ja', 'Node.js'),
(11, 'ja', 'Figma'),
(12, 'ja', 'Adobe XD'),
(13, 'ja', 'Photoshop'),
(14, 'ja', 'Illustrator'),
(15, 'ja', 'After Effects'),
(16, 'ja', 'Blender'),
(17, 'ja', 'SEO'),
(18, 'ja', 'Google広告'),
(19, 'ja', 'Facebook広告'),
(20, 'ja', 'コンテンツ戦略');
