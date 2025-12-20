// FeeZero Platform Internationalization (8 Languages)
import type { Language, Translations } from './types';

export const translations: Translations = {
  // Navigation
  'nav.home': {
    ko: '홈',
    en: 'Home',
    zh: '首页',
    ja: 'ホーム',
    vi: 'Trang chủ',
    th: 'หน้าแรก',
    es: 'Inicio',
    de: 'Startseite'
  },
  'nav.find_projects': {
    ko: '프로젝트 찾기',
    en: 'Find Projects',
    zh: '查找项目',
    ja: 'プロジェクトを探す',
    vi: 'Tìm Dự án',
    th: 'ค้นหาโครงการ',
    es: 'Buscar Proyectos',
    de: 'Projekte finden'
  },
  'nav.find_experts': {
    ko: '전문가 찾기',
    en: 'Find Experts',
    zh: '查找专家',
    ja: 'エキスパートを探す',
    vi: 'Tìm Chuyên gia',
    th: 'ค้นหาผู้เชี่ยวชาญ',
    es: 'Buscar Expertos',
    de: 'Experten finden'
  },
  'nav.categories': {
    ko: '카테고리',
    en: 'Categories',
    zh: '类别',
    ja: 'カテゴリー',
    vi: 'Danh mục',
    th: 'หมวดหมู่',
    es: 'Categorías',
    de: 'Kategorien'
  },
  'nav.post_project': {
    ko: '프로젝트 등록',
    en: 'Post Project',
    zh: '发布项目',
    ja: 'プロジェクト登録',
    vi: 'Đăng Dự án',
    th: 'โพสต์โครงการ',
    es: 'Publicar Proyecto',
    de: 'Projekt erstellen'
  },
  'nav.messages': {
    ko: '메시지',
    en: 'Messages',
    zh: '消息',
    ja: 'メッセージ',
    vi: 'Tin nhắn',
    th: 'ข้อความ',
    es: 'Mensajes',
    de: 'Nachrichten'
  },
  'nav.my_activity': {
    ko: '내 활동',
    en: 'My Activity',
    zh: '我的活动',
    ja: 'マイアクティビティ',
    vi: 'Hoạt động của tôi',
    th: 'กิจกรรมของฉัน',
    es: 'Mi Actividad',
    de: 'Meine Aktivität'
  },
  'nav.profile': {
    ko: '내 프로필',
    en: 'My Profile',
    zh: '我的资料',
    ja: 'マイプロフィール',
    vi: 'Hồ sơ của tôi',
    th: 'โปรไฟล์ของฉัน',
    es: 'Mi Perfil',
    de: 'Mein Profil'
  },
  'nav.payment': {
    ko: '결제',
    en: 'Payment',
    zh: '支付',
    ja: '支払い',
    vi: 'Thanh toán',
    th: 'การชำระเงิน',
    es: 'Pago',
    de: 'Zahlung'
  },
  'nav.membership': {
    ko: '멤버십',
    en: 'Membership',
    zh: '会员',
    ja: 'メンバーシップ',
    vi: 'Thành viên',
    th: 'สมาชิก',
    es: 'Membresía',
    de: 'Mitgliedschaft'
  },
  'nav.support': {
    ko: '고객센터',
    en: 'Support',
    zh: '客服中心',
    ja: 'カスタマーサポート',
    vi: 'Hỗ trợ',
    th: 'ฝ่ายสนับสนุน',
    es: 'Soporte',
    de: 'Support'
  },
  'nav.settings': {
    ko: '설정',
    en: 'Settings',
    zh: '设置',
    ja: '設定',
    vi: 'Cài đặt',
    th: 'การตั้งค่า',
    es: 'Configuración',
    de: 'Einstellungen'
  },
  
  // Authentication
  'auth.login': {
    ko: '로그인',
    en: 'Login',
    zh: '登录',
    ja: 'ログイン',
    vi: 'Đăng nhập',
    th: 'เข้าสู่ระบบ',
    es: 'Iniciar sesión',
    de: 'Anmelden'
  },
  'auth.register': {
    ko: '회원가입',
    en: 'Register',
    zh: '注册',
    ja: '会員登録',
    vi: 'Đăng ký',
    th: 'ลงทะเบียน',
    es: 'Registrarse',
    de: 'Registrieren'
  },
  'auth.logout': {
    ko: '로그아웃',
    en: 'Logout',
    zh: '登出',
    ja: 'ログアウト',
    vi: 'Đăng xuất',
    th: 'ออกจากระบบ',
    es: 'Cerrar sesión',
    de: 'Abmelden'
  },
  'auth.email': {
    ko: '이메일',
    en: 'Email',
    zh: '电子邮箱',
    ja: 'メール',
    vi: 'Email',
    th: 'อีเมล',
    es: 'Correo electrónico',
    de: 'E-Mail'
  },
  'auth.password': {
    ko: '비밀번호',
    en: 'Password',
    zh: '密码',
    ja: 'パスワード',
    vi: 'Mật khẩu',
    th: 'รหัสผ่าน',
    es: 'Contraseña',
    de: 'Passwort'
  },
  'auth.full_name': {
    ko: '이름',
    en: 'Full Name',
    zh: '姓名',
    ja: '氏名',
    vi: 'Họ và tên',
    th: 'ชื่อเต็ม',
    es: 'Nombre completo',
    de: 'Vollständiger Name'
  },
  'auth.nickname': {
    ko: '닉네임',
    en: 'Nickname',
    zh: '昵称',
    ja: 'ニックネーム',
    vi: 'Biệt danh',
    th: 'ชื่อเล่น',
    es: 'Apodo',
    de: 'Spitzname'
  },
  'auth.phone_number': {
    ko: '연락처',
    en: 'Phone Number',
    zh: '联系方式',
    ja: '連絡先',
    vi: 'Số điện thoại',
    th: 'หมายเลขโทรศัพท์',
    es: 'Número de teléfono',
    de: 'Telefonnummer'
  },
  'auth.country': {
    ko: '국가',
    en: 'Country',
    zh: '国家',
    ja: '国',
    vi: 'Quốc gia',
    th: 'ประเทศ',
    es: 'País',
    de: 'Land'
  },
  'auth.user_type': {
    ko: '사용자 유형',
    en: 'User Type',
    zh: '用户类型',
    ja: 'ユーザータイプ',
    vi: 'Loại người dùng',
    th: 'ประเภทผู้ใช้',
    es: 'Tipo de usuario',
    de: 'Benutzertyp'
  },
  'auth.client': {
    ko: '의뢰인',
    en: 'Client',
    zh: '委托人',
    ja: '依頼者',
    vi: 'Khách hàng',
    th: 'ลูกค้า',
    es: 'Cliente',
    de: 'Auftraggeber'
  },
  'auth.freelancer': {
    ko: '프리랜서',
    en: 'Freelancer',
    zh: '自由职业者',
    ja: 'フリーランサー',
    vi: 'Freelancer',
    th: 'ฟรีแลนซ์',
    es: 'Freelancer',
    de: 'Freiberufler'
  },
  
  // Platform Info
  'platform.name': {
    ko: 'FeeZero',
    en: 'FeeZero',
    zh: 'FeeZero',
    ja: 'FeeZero',
    vi: 'FeeZero',
    th: 'FeeZero',
    es: 'FeeZero',
    de: 'FeeZero'
  },
  'platform.tagline': {
    ko: '수수료 제로, 프리랜서 플랫폼의 새로운 기준',
    en: 'Zero Fees, New Standard for Freelance Platforms',
    zh: '零手续费，自由职业平台的新标准',
    ja: '手数料ゼロ、フリーランスプラットフォームの新基準',
    vi: 'Không phí, Tiêu chuẩn mới cho Nền tảng Freelance',
    th: 'ค่าธรรมเนียมศูนย์ มาตรฐานใหม่สำหรับแพลตฟอร์มฟรีแลนซ์',
    es: 'Sin comisiones, Nuevo estándar para plataformas Freelance',
    de: 'Null Gebühren, Neuer Standard für Freelance-Plattformen'
  },
  'platform.fee_policy': {
    ko: '의뢰인 2%, 개발자 0%',
    en: 'Client 2%, Developer 0%',
    zh: '委托人2%，开发者0%',
    ja: '依頼者2%、開発者0%',
    vi: 'Khách hàng 2%, Nhà phát triển 0%',
    th: 'ลูกค้า 2% นักพัฒนา 0%',
    es: 'Cliente 2%, Desarrollador 0%',
    de: 'Auftraggeber 2%, Entwickler 0%'
  },
  'platform.global_description': {
    ko: '전 세계 의뢰인과 개발자를 연결하는 글로벌 플랫폼',
    en: 'Global platform connecting clients and developers worldwide',
    zh: '连接全球委托人和开发者的全球平台',
    ja: '世界中の依頼者と開発者をつなぐグローバルプラットフォーム',
    vi: 'Nền tảng toàn cầu kết nối khách hàng và nhà phát triển trên toàn thế giới',
    th: 'แพลตฟอร์มระดับโลกเชื่อมต่อลูกค้าและนักพัฒนาทั่วโลก',
    es: 'Plataforma global que conecta clientes y desarrolladores en todo el mundo',
    de: 'Globale Plattform, die Kunden und Entwickler weltweit verbindet'
  },
  
  // Common Actions
  'action.search': {
    ko: '검색',
    en: 'Search',
    zh: '搜索',
    ja: '検索',
    vi: 'Tìm kiếm',
    th: 'ค้นหา',
    es: 'Buscar',
    de: 'Suchen'
  },
  'action.submit': {
    ko: '제출',
    en: 'Submit',
    zh: '提交',
    ja: '提出',
    vi: 'Gửi',
    th: 'ส่ง',
    es: 'Enviar',
    de: 'Absenden'
  },
  'action.cancel': {
    ko: '취소',
    en: 'Cancel',
    zh: '取消',
    ja: 'キャンセル',
    vi: 'Hủy',
    th: 'ยกเลิก',
    es: 'Cancelar',
    de: 'Abbrechen'
  },
  'action.save': {
    ko: '저장',
    en: 'Save',
    zh: '保存',
    ja: '保存',
    vi: 'Lưu',
    th: 'บันทึก',
    es: 'Guardar',
    de: 'Speichern'
  },
  'action.edit': {
    ko: '수정',
    en: 'Edit',
    zh: '编辑',
    ja: '編集',
    vi: 'Chỉnh sửa',
    th: 'แก้ไข',
    es: 'Editar',
    de: 'Bearbeiten'
  },
  'action.delete': {
    ko: '삭제',
    en: 'Delete',
    zh: '删除',
    ja: '削除',
    vi: 'Xóa',
    th: 'ลบ',
    es: 'Eliminar',
    de: 'Löschen'
  },
  'action.view': {
    ko: '보기',
    en: 'View',
    zh: '查看',
    ja: '表示',
    vi: 'Xem',
    th: 'ดู',
    es: 'Ver',
    de: 'Ansehen'
  },
  'action.download': {
    ko: '다운로드',
    en: 'Download',
    zh: '下载',
    ja: 'ダウンロード',
    vi: 'Tải xuống',
    th: 'ดาวน์โหลด',
    es: 'Descargar',
    de: 'Herunterladen'
  },
  
  // Status
  'status.active': {
    ko: '활성',
    en: 'Active',
    zh: '活跃',
    ja: 'アクティブ',
    vi: 'Hoạt động',
    th: 'ใช้งาน',
    es: 'Activo',
    de: 'Aktiv'
  },
  'status.inactive': {
    ko: '비활성',
    en: 'Inactive',
    zh: '不活跃',
    ja: '非アクティブ',
    vi: 'Không hoạt động',
    th: 'ไม่ใช้งาน',
    es: 'Inactivo',
    de: 'Inaktiv'
  },
  'status.pending': {
    ko: '대기 중',
    en: 'Pending',
    zh: '待定',
    ja: '保留中',
    vi: 'Đang chờ',
    th: 'รอดำเนินการ',
    es: 'Pendiente',
    de: 'Ausstehend'
  },
  'status.completed': {
    ko: '완료',
    en: 'Completed',
    zh: '已完成',
    ja: '完了',
    vi: 'Hoàn thành',
    th: 'เสร็จสิ้น',
    es: 'Completado',
    de: 'Abgeschlossen'
  },
  'status.cancelled': {
    ko: '취소됨',
    en: 'Cancelled',
    zh: '已取消',
    ja: 'キャンセル済み',
    vi: 'Đã hủy',
    th: 'ยกเลิกแล้ว',
    es: 'Cancelado',
    de: 'Storniert'
  },
  
  // Features
  'feature.lowest_fees': {
    ko: '최저 수수료',
    en: 'Lowest Fees',
    zh: '最低手续费',
    ja: '最低手数料',
    vi: 'Phí thấp nhất',
    th: 'ค่าธรรมเนียมต่ำสุด',
    es: 'Tarifas más bajas',
    de: 'Niedrigste Gebühren'
  },
  'feature.lowest_fees_desc': {
    ko: '의뢰인 2%, 개발자 0% - 업계 최저 수수료 정책',
    en: 'Client 2%, Developer 0% - Industry lowest fee policy',
    zh: '委托人2%，开发者0% - 行业最低手续费政策',
    ja: '依頼者2%、開発者0% - 業界最低手数料ポリシー',
    vi: 'Khách hàng 2%, Nhà phát triển 0% - Chính sách phí thấp nhất trong ngành',
    th: 'ลูกค้า 2% นักพัฒนา 0% - นโยบายค่าธรรมเนียมต่ำสุดในอุตสาหกรรม',
    es: 'Cliente 2%, Desarrollador 0% - Política de tarifas más bajas de la industria',
    de: 'Auftraggeber 2%, Entwickler 0% - Branchenniedrigste Gebührenpolitik'
  },
  'feature.usdt_payment': {
    ko: 'USDT 결제',
    en: 'USDT Payment',
    zh: 'USDT支付',
    ja: 'USDT決済',
    vi: 'Thanh toán USDT',
    th: 'การชำระเงิน USDT',
    es: 'Pago USDT',
    de: 'USDT-Zahlung'
  },
  'feature.usdt_payment_desc': {
    ko: '안전하고 빠른 암호화폐 결제 시스템',
    en: 'Secure and fast cryptocurrency payment system',
    zh: '安全快速的加密货币支付系统',
    ja: '安全で迅速な暗号通貨決済システム',
    vi: 'Hệ thống thanh toán tiền điện tử an toàn và nhanh chóng',
    th: 'ระบบการชำระเงินคริปโตที่ปลอดภัยและรวดเร็ว',
    es: 'Sistema de pago con criptomonedas seguro y rápido',
    de: 'Sicheres und schnelles Kryptowährungs-Zahlungssystem'
  },
  'feature.global_network': {
    ko: '글로벌 네트워크',
    en: 'Global Network',
    zh: '全球网络',
    ja: 'グローバルネットワーク',
    vi: 'Mạng lưới toàn cầu',
    th: 'เครือข่ายระดับโลก',
    es: 'Red Global',
    de: 'Globales Netzwerk'
  },
  'feature.global_network_desc': {
    ko: '한국어, 영어, 중국어, 일본어, 베트남어, 태국어, 스페인어, 독일어 지원',
    en: 'Support for Korean, English, Chinese, Japanese, Vietnamese, Thai, Spanish, German',
    zh: '支持韩语、英语、中文、日语、越南语、泰语、西班牙语、德语',
    ja: '韓国語、英語、中国語、日本語、ベトナム語、タイ語、スペイン語、ドイツ語をサポート',
    vi: 'Hỗ trợ tiếng Hàn, Anh, Trung, Nhật, Việt, Thái, Tây Ban Nha, Đức',
    th: 'รองรับภาษาเกาหลี อังกฤษ จีน ญี่ปุ่น เวียดนาม ไทย สเปน เยอรมัน',
    es: 'Soporte para coreano, inglés, chino, japonés, vietnamita, tailandés, español, alemán',
    de: 'Unterstützung für Koreanisch, Englisch, Chinesisch, Japanisch, Vietnamesisch, Thai, Spanisch, Deutsch'
  },
  
  // Stats
  'stats.freelancers': {
    ko: '등록 프리랜서',
    en: 'Freelancers',
    zh: '注册自由职业者',
    ja: '登録フリーランサー',
    vi: 'Freelancer đã đăng ký',
    th: 'ฟรีแลนซ์ที่ลงทะเบียน',
    es: 'Freelancers registrados',
    de: 'Registrierte Freiberufler'
  },
  'stats.completed_projects': {
    ko: '완료된 프로젝트',
    en: 'Completed Projects',
    zh: '已完成项目',
    ja: '完了プロジェクト',
    vi: 'Dự án hoàn thành',
    th: 'โครงการที่เสร็จสิ้น',
    es: 'Proyectos completados',
    de: 'Abgeschlossene Projekte'
  },
  'stats.client_satisfaction': {
    ko: '고객 만족도',
    en: 'Client Satisfaction',
    zh: '客户满意度',
    ja: '顧客満足度',
    vi: 'Sự hài lòng của khách hàng',
    th: 'ความพึงพอใจของลูกค้า',
    es: 'Satisfacción del cliente',
    de: 'Kundenzufriedenheit'
  },
  'stats.customer_support': {
    ko: '고객 지원',
    en: 'Customer Support',
    zh: '客户支持',
    ja: 'カスタマーサポート',
    vi: 'Hỗ trợ khách hàng',
    th: 'การสนับสนุนลูกค้า',
    es: 'Soporte al cliente',
    de: 'Kundensupport'
  },
  
  // Footer
  'footer.services': {
    ko: '서비스',
    en: 'Services',
    zh: '服务',
    ja: 'サービス',
    vi: 'Dịch vụ',
    th: 'บริการ',
    es: 'Servicios',
    de: 'Dienstleistungen'
  },
  'footer.support': {
    ko: '지원',
    en: 'Support',
    zh: '支持',
    ja: 'サポート',
    vi: 'Hỗ trợ',
    th: 'การสนับสนุน',
    es: 'Soporte',
    de: 'Unterstützung'
  },
  'footer.social_media': {
    ko: '소셜 미디어',
    en: 'Social Media',
    zh: '社交媒体',
    ja: 'ソーシャルメディア',
    vi: 'Mạng xã hội',
    th: 'โซเชียลมีเดีย',
    es: 'Redes sociales',
    de: 'Soziale Medien'
  },
  'footer.contact': {
    ko: '문의하기',
    en: 'Contact',
    zh: '联系我们',
    ja: 'お問い合わせ',
    vi: 'Liên hệ',
    th: 'ติดต่อ',
    es: 'Contacto',
    de: 'Kontakt'
  },
  'footer.why_choose': {
    ko: '왜 FeeZero를 선택해야 할까요?',
    en: 'Why Choose FeeZero?',
    zh: '为什么选择 FeeZero?',
    ja: 'なぜ FeeZero を選ぶべきか？',
    vi: 'Tại sao chọn FeeZero?',
    th: 'ทำไมต้องเลือก FeeZero?',
    es: '¿Por qué elegir FeeZero?',
    de: 'Warum FeeZero wählen?'
  }
};

export function t(key: string, lang: Language = 'ko'): string {
  return translations[key]?.[lang] || key;
}

export function getLanguageFromRequest(request: Request): Language {
  // Try to get language from query parameter
  const url = new URL(request.url);
  const queryLang = url.searchParams.get('lang');
  if (queryLang && ['ko', 'en', 'zh', 'ja', 'vi', 'th', 'es', 'de'].includes(queryLang)) {
    return queryLang as Language;
  }
  
  // Try to get language from Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    const lang = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();
    if (lang === 'ko') return 'ko';
    if (lang === 'en') return 'en';
    if (lang === 'zh') return 'zh';
    if (lang === 'ja') return 'ja';
    if (lang === 'vi') return 'vi';
    if (lang === 'th') return 'th';
    if (lang === 'es') return 'es';
    if (lang === 'de') return 'de';
  }
  
  // Default to Korean
  return 'ko';
}
