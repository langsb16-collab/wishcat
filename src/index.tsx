import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import type { Bindings } from './types'
import { getLanguageFromRequest, t } from './i18n'
import { 
  getCategoriesWithTranslations,
  createApiResponse,
  createPaginatedResponse,
  getPaginationParams,
  calculateOffset,
  queryDatabase
} from './db'

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// ===========================
// API Routes
// ===========================

// Health check
app.get('/api/health', (c) => {
  return c.json({
    success: true,
    message: 'FeeZero API is running',
    timestamp: new Date().toISOString()
  })
})

// Get all categories
app.get('/api/categories', async (c) => {
  try {
    const lang = getLanguageFromRequest(c.req.raw);
    const { DB } = c.env;
    
    // Get parent categories
    const parentCategories = await getCategoriesWithTranslations(DB, lang, null);
    
    // Get subcategories for each parent
    const categoriesWithChildren = await Promise.all(
      parentCategories.map(async (parent) => {
        const children = await getCategoriesWithTranslations(DB, lang, parent.id);
        return {
          ...parent,
          children
        };
      })
    );
    
    return c.json(createApiResponse(true, categoriesWithChildren));
  } catch (error: any) {
    return c.json(createApiResponse(false, null, error.message), 500);
  }
})

// Get single category
app.get('/api/categories/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    const lang = getLanguageFromRequest(c.req.raw);
    const { DB } = c.env;
    
    const categories = await getCategoriesWithTranslations(DB, lang);
    const category = categories.find(cat => cat.id === id);
    
    if (!category) {
      return c.json(createApiResponse(false, null, 'Category not found'), 404);
    }
    
    // Get subcategories
    const children = await getCategoriesWithTranslations(DB, lang, id);
    
    return c.json(createApiResponse(true, {
      ...category,
      children
    }));
  } catch (error: any) {
    return c.json(createApiResponse(false, null, error.message), 500);
  }
})

// Get all projects
app.get('/api/projects', async (c) => {
  try {
    const { DB } = c.env;
    const { page = 1, limit = 20 } = getPaginationParams(new URL(c.req.url));
    const offset = calculateOffset(page, limit);
    
    // Get total count
    const countResult = await queryDatabase<{ count: number }>(
      DB,
      'SELECT COUNT(*) as count FROM projects WHERE status = ?',
      ['open']
    );
    const total = countResult[0]?.count || 0;
    
    // Get projects with pagination
    const projects = await queryDatabase(
      DB,
      `SELECT 
        p.*,
        u.nickname as client_nickname,
        u.country as client_country
      FROM projects p
      LEFT JOIN users u ON p.client_id = u.id
      WHERE p.status = ?
      ORDER BY p.is_urgent DESC, p.created_at DESC
      LIMIT ? OFFSET ?`,
      ['open', limit, offset]
    );
    
    return c.json(createPaginatedResponse(projects, page, limit, total));
  } catch (error: any) {
    return c.json(createApiResponse(false, null, error.message), 500);
  }
})

// Get single project
app.get('/api/projects/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    const { DB } = c.env;
    
    const projects = await queryDatabase(
      DB,
      `SELECT 
        p.*,
        u.nickname as client_nickname,
        u.country as client_country,
        u.profile_photo_url as client_photo
      FROM projects p
      LEFT JOIN users u ON p.client_id = u.id
      WHERE p.id = ?`,
      [id]
    );
    
    if (!projects || projects.length === 0) {
      return c.json(createApiResponse(false, null, 'Project not found'), 404);
    }
    
    return c.json(createApiResponse(true, projects[0]));
  } catch (error: any) {
    return c.json(createApiResponse(false, null, error.message), 500);
  }
})

// Get all freelancers
app.get('/api/freelancers', async (c) => {
  try {
    const { DB } = c.env;
    const { page = 1, limit = 20 } = getPaginationParams(new URL(c.req.url));
    const offset = calculateOffset(page, limit);
    
    // Get total count
    const countResult = await queryDatabase<{ count: number }>(
      DB,
      'SELECT COUNT(*) as count FROM freelancer_profiles'
    );
    const total = countResult[0]?.count || 0;
    
    // Get freelancers with pagination
    const freelancers = await queryDatabase(
      DB,
      `SELECT 
        fp.*,
        u.nickname,
        u.country,
        u.profile_photo_url,
        u.preferred_language
      FROM freelancer_profiles fp
      LEFT JOIN users u ON fp.user_id = u.id
      WHERE u.is_active = 1
      ORDER BY fp.average_rating DESC, fp.completed_projects DESC
      LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    return c.json(createPaginatedResponse(freelancers, page, limit, total));
  } catch (error: any) {
    return c.json(createApiResponse(false, null, error.message), 500);
  }
})

// Get single freelancer
app.get('/api/freelancers/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    const { DB } = c.env;
    
    const freelancers = await queryDatabase(
      DB,
      `SELECT 
        fp.*,
        u.nickname,
        u.country,
        u.profile_photo_url,
        u.preferred_language,
        u.email
      FROM freelancer_profiles fp
      LEFT JOIN users u ON fp.user_id = u.id
      WHERE fp.id = ? AND u.is_active = 1`,
      [id]
    );
    
    if (!freelancers || freelancers.length === 0) {
      return c.json(createApiResponse(false, null, 'Freelancer not found'), 404);
    }
    
    // Get portfolio items
    const portfolio = await queryDatabase(
      DB,
      `SELECT * FROM portfolio_items WHERE freelancer_id = ? ORDER BY display_order ASC`,
      [id]
    );
    
    return c.json(createApiResponse(true, {
      ...freelancers[0],
      portfolio
    }));
  } catch (error: any) {
    return c.json(createApiResponse(false, null, error.message), 500);
  }
})

// ===========================
// Frontend Routes
// ===========================

app.get('/', (c) => {
  const lang = getLanguageFromRequest(c.req.raw);
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${t('platform.name', lang)} - ${t('platform.tagline', lang)}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Noto+Sans+JP:wght@300;400;500;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap');
          
          body {
            font-family: 'Noto Sans KR', 'Noto Sans JP', 'Noto Sans SC', sans-serif;
          }
          
          .hero-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          
          .card-hover {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Navigation -->
        <nav class="bg-white shadow-md sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <span class="text-2xl font-bold text-purple-600">
                            <i class="fas fa-handshake mr-2"></i>${t('platform.name', lang)}
                        </span>
                    </div>
                    
                    <div class="hidden md:flex items-center space-x-6">
                        <a href="/" class="text-gray-700 hover:text-purple-600">
                            <i class="fas fa-home mr-1"></i>${t('nav.home', lang)}
                        </a>
                        <a href="/projects" class="text-gray-700 hover:text-purple-600">
                            <i class="fas fa-briefcase mr-1"></i>${t('nav.find_projects', lang)}
                        </a>
                        <a href="/freelancers" class="text-gray-700 hover:text-purple-600">
                            <i class="fas fa-users mr-1"></i>${t('nav.find_experts', lang)}
                        </a>
                        <a href="/categories" class="text-gray-700 hover:text-purple-600">
                            <i class="fas fa-th-large mr-1"></i>${t('nav.categories', lang)}
                        </a>
                    </div>
                    
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-2">
                            <button onclick="changeLang('ko')" class="px-2 py-1 rounded ${lang === 'ko' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}">한</button>
                            <button onclick="changeLang('en')" class="px-2 py-1 rounded ${lang === 'en' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}">EN</button>
                            <button onclick="changeLang('zh')" class="px-2 py-1 rounded ${lang === 'zh' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}">中</button>
                            <button onclick="changeLang('ja')" class="px-2 py-1 rounded ${lang === 'ja' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}">日</button>
                        </div>
                        <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                            ${t('auth.login', lang)}
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <div class="hero-gradient text-white py-20">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 class="text-5xl font-bold mb-6">
                    ${t('platform.tagline', lang)}
                </h1>
                <p class="text-xl mb-4">${t('platform.fee_policy', lang)}</p>
                <p class="text-lg mb-8 opacity-90">
                    ${lang === 'ko' ? '전 세계 의뢰인과 개발자를 연결하는 글로벌 플랫폼' : 
                      lang === 'en' ? 'Global platform connecting clients and developers worldwide' :
                      lang === 'zh' ? '连接全球委托人和开发者的全球平台' :
                      '世界中の依頼者と開発者をつなぐグローバルプラットフォーム'}
                </p>
                <div class="flex justify-center space-x-4">
                    <button class="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                        <i class="fas fa-briefcase mr-2"></i>${t('nav.find_projects', lang)}
                    </button>
                    <button class="bg-purple-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-900 transition">
                        <i class="fas fa-users mr-2"></i>${t('nav.find_experts', lang)}
                    </button>
                </div>
            </div>
        </div>

        <!-- Features Section -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 class="text-3xl font-bold text-center mb-12 text-gray-800">
                ${lang === 'ko' ? '왜 FeeZero를 선택해야 할까요?' : 
                  lang === 'en' ? 'Why Choose FeeZero?' :
                  lang === 'zh' ? '为什么选择 FeeZero?' :
                  'なぜ FeeZero を選ぶべきか？'}
            </h2>
            
            <div class="grid md:grid-cols-3 gap-8">
                <div class="bg-white p-8 rounded-xl shadow-lg card-hover text-center">
                    <div class="text-5xl text-purple-600 mb-4">
                        <i class="fas fa-percentage"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-3 text-gray-800">
                        ${lang === 'ko' ? '최저 수수료' : 
                          lang === 'en' ? 'Lowest Fees' :
                          lang === 'zh' ? '最低手续费' :
                          '最低手数料'}
                    </h3>
                    <p class="text-gray-600">
                        ${lang === 'ko' ? '의뢰인 2%, 개발자 0% - 업계 최저 수수료 정책' : 
                          lang === 'en' ? 'Client 2%, Developer 0% - Industry lowest fee policy' :
                          lang === 'zh' ? '委托人2%，开发者0% - 行业最低手续费政策' :
                          '依頼者2%、開発者0% - 業界最低手数料ポリシー'}
                    </p>
                </div>
                
                <div class="bg-white p-8 rounded-xl shadow-lg card-hover text-center">
                    <div class="text-5xl text-green-600 mb-4">
                        <i class="fab fa-bitcoin"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-3 text-gray-800">
                        ${lang === 'ko' ? 'USDT 결제' : 
                          lang === 'en' ? 'USDT Payment' :
                          lang === 'zh' ? 'USDT支付' :
                          'USDT決済'}
                    </h3>
                    <p class="text-gray-600">
                        ${lang === 'ko' ? '안전하고 빠른 암호화폐 결제 시스템' : 
                          lang === 'en' ? 'Secure and fast cryptocurrency payment system' :
                          lang === 'zh' ? '安全快速的加密货币支付系统' :
                          '安全で迅速な暗号通貨決済システム'}
                    </p>
                </div>
                
                <div class="bg-white p-8 rounded-xl shadow-lg card-hover text-center">
                    <div class="text-5xl text-blue-600 mb-4">
                        <i class="fas fa-globe"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-3 text-gray-800">
                        ${lang === 'ko' ? '글로벌 네트워크' : 
                          lang === 'en' ? 'Global Network' :
                          lang === 'zh' ? '全球网络' :
                          'グローバルネットワーク'}
                    </h3>
                    <p class="text-gray-600">
                        ${lang === 'ko' ? '한국어, 영어, 중국어, 일본어 지원' : 
                          lang === 'en' ? 'Support for Korean, English, Chinese, Japanese' :
                          lang === 'zh' ? '支持韩语、英语、中文、日语' :
                          '韓国語、英語、中国語、日本語をサポート'}
                    </p>
                </div>
            </div>
        </div>

        <!-- Stats Section -->
        <div class="bg-purple-600 text-white py-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div class="text-4xl font-bold mb-2">10,000+</div>
                        <div class="text-purple-200">${lang === 'ko' ? '등록 프리랜서' : lang === 'en' ? 'Freelancers' : lang === 'zh' ? '注册自由职业者' : '登録フリーランサー'}</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold mb-2">5,000+</div>
                        <div class="text-purple-200">${lang === 'ko' ? '완료된 프로젝트' : lang === 'en' ? 'Completed Projects' : lang === 'zh' ? '已完成项目' : '完了プロジェクト'}</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold mb-2">98%</div>
                        <div class="text-purple-200">${lang === 'ko' ? '고객 만족도' : lang === 'en' ? 'Client Satisfaction' : lang === 'zh' ? '客户满意度' : '顧客満足度'}</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold mb-2">24/7</div>
                        <div class="text-purple-200">${lang === 'ko' ? '고객 지원' : lang === 'en' ? 'Customer Support' : lang === 'zh' ? '客户支持' : 'カスタマーサポート'}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="bg-gray-800 text-white py-12">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid md:grid-cols-4 gap-8">
                    <div>
                        <h4 class="text-xl font-bold mb-4">${t('platform.name', lang)}</h4>
                        <p class="text-gray-400">${t('platform.tagline', lang)}</p>
                    </div>
                    <div>
                        <h4 class="font-semibold mb-4">${lang === 'ko' ? '서비스' : lang === 'en' ? 'Services' : lang === 'zh' ? '服务' : 'サービス'}</h4>
                        <ul class="space-y-2 text-gray-400">
                            <li><a href="/projects" class="hover:text-white">${t('nav.find_projects', lang)}</a></li>
                            <li><a href="/freelancers" class="hover:text-white">${t('nav.find_experts', lang)}</a></li>
                            <li><a href="/categories" class="hover:text-white">${t('nav.categories', lang)}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-semibold mb-4">${lang === 'ko' ? '지원' : lang === 'en' ? 'Support' : lang === 'zh' ? '支持' : 'サポート'}</h4>
                        <ul class="space-y-2 text-gray-400">
                            <li><a href="/faq" class="hover:text-white">FAQ</a></li>
                            <li><a href="/contact" class="hover:text-white">${lang === 'ko' ? '문의하기' : lang === 'en' ? 'Contact' : lang === 'zh' ? '联系我们' : 'お問い合わせ'}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-semibold mb-4">${lang === 'ko' ? '소셜 미디어' : lang === 'en' ? 'Social Media' : lang === 'zh' ? '社交媒体' : 'ソーシャルメディア'}</h4>
                        <div class="flex space-x-4 text-2xl">
                            <a href="#" class="hover:text-purple-400"><i class="fab fa-twitter"></i></a>
                            <a href="#" class="hover:text-purple-400"><i class="fab fa-facebook"></i></a>
                            <a href="#" class="hover:text-purple-400"><i class="fab fa-linkedin"></i></a>
                        </div>
                    </div>
                </div>
                <div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2025 ${t('platform.name', lang)}. All rights reserved.</p>
                </div>
            </div>
        </footer>

        <script>
            function changeLang(lang) {
                const url = new URL(window.location.href);
                url.searchParams.set('lang', lang);
                window.location.href = url.toString();
            }
            
            // Load data from API
            async function loadData() {
                try {
                    const response = await fetch('/api/categories?lang=${lang}');
                    const data = await response.json();
                    console.log('Categories:', data);
                } catch (error) {
                    console.error('Error loading data:', error);
                }
            }
            
            loadData();
        </script>
    </body>
    </html>
  `)
})

export default app
