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
import admin from './admin'

const app = new Hono<{ Bindings: Bindings }>()

// Mount admin routes
app.route('/admin', admin)

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

// Projects page
app.get('/projects', async (c) => {
  const lang = getLanguageFromRequest(c.req.raw);
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${t('nav.find_projects', lang)} - ${t('platform.name', lang)}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap');
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Noto Sans KR', sans-serif;
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <nav class="bg-white shadow-sm sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <a href="/?lang=${lang}" class="text-xl font-bold text-gray-900">
                        ${t('platform.name', lang)}
                    </a>
                    <div class="flex items-center space-x-4">
                        <a href="/?lang=${lang}" class="text-gray-600 hover:text-gray-900">${t('nav.home', lang)}</a>
                        <a href="/projects?lang=${lang}" class="text-gray-900 font-semibold">${t('nav.find_projects', lang)}</a>
                        <a href="/freelancers?lang=${lang}" class="text-gray-600 hover:text-gray-900">${t('nav.find_experts', lang)}</a>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-6">
                <i class="fas fa-project-diagram mr-3"></i>
                ${t('nav.find_projects', lang)}
            </h1>
            
            <div id="projectsContainer" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="text-center py-12 col-span-full">
                    <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
                    <p class="mt-4 text-gray-500">${lang === 'ko' ? '로딩 중...' : 'Loading...'}</p>
                </div>
            </div>
            
            <div id="pagination" class="mt-8 flex justify-center"></div>
        </div>

        <script>
            const lang = new URLSearchParams(window.location.search).get('lang') || 'ko';
            let currentPage = 1;
            
            async function loadProjects(page = 1) {
                try {
                    const response = await fetch(\`/api/projects?page=\${page}&limit=12\`);
                    const data = await response.json();
                    
                    const container = document.getElementById('projectsContainer');
                    
                    if (!data.success || !data.data || data.data.length === 0) {
                        container.innerHTML = \`
                            <div class="text-center py-12 col-span-full">
                                <i class="fas fa-inbox text-6xl text-gray-300"></i>
                                <p class="mt-4 text-gray-500">\${lang === 'ko' ? '프로젝트가 없습니다' : 'No projects found'}</p>
                            </div>
                        \`;
                        return;
                    }
                    
                    container.innerHTML = data.data.map(project => \`
                        <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                            \${project.is_urgent ? '<span class="inline-block px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded mb-2">🔥 ' + (lang === 'ko' ? '긴급' : 'URGENT') + '</span>' : ''}
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">\${project.title}</h3>
                            <p class="text-gray-600 text-sm mb-4 line-clamp-2">\${project.description}</p>
                            <div class="flex items-center justify-between mb-4">
                                <span class="text-2xl font-bold text-green-600">\${project.budget_min} - \${project.budget_max} USDT</span>
                            </div>
                            <div class="flex items-center justify-between text-sm text-gray-500">
                                <span><i class="far fa-clock mr-1"></i>\${new Date(project.created_at).toLocaleDateString()}</span>
                                <span><i class="fas fa-user mr-1"></i>\${project.client_nickname || 'Client'}</span>
                            </div>
                            <a href="/projects/\${project.id}?lang=\${lang}" class="mt-4 block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition">
                                \${lang === 'ko' ? '자세히 보기' : 'View Details'}
                            </a>
                        </div>
                    \`).join('');
                    
                    // Pagination
                    if (data.total_pages > 1) {
                        const pagination = document.getElementById('pagination');
                        let paginationHTML = '';
                        
                        for (let i = 1; i <= data.total_pages; i++) {
                            paginationHTML += \`
                                <button 
                                    onclick="loadProjects(\${i})" 
                                    class="mx-1 px-4 py-2 rounded \${i === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}"
                                >
                                    \${i}
                                </button>
                            \`;
                        }
                        
                        pagination.innerHTML = paginationHTML;
                    }
                } catch (error) {
                    console.error('Error loading projects:', error);
                    document.getElementById('projectsContainer').innerHTML = \`
                        <div class="text-center py-12 col-span-full">
                            <i class="fas fa-exclamation-triangle text-6xl text-red-300"></i>
                            <p class="mt-4 text-red-500">\${lang === 'ko' ? '프로젝트를 불러오는데 실패했습니다' : 'Failed to load projects'}</p>
                        </div>
                    \`;
                }
            }
            
            // Load projects on page load
            loadProjects();
        </script>
    </body>
    </html>
  `);
})

// Categories page
app.get('/categories', async (c) => {
  const lang = getLanguageFromRequest(c.req.raw);
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${t('nav.categories', lang)} - ${t('platform.name', lang)}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap');
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Noto Sans KR', sans-serif;
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <nav class="bg-white shadow-sm sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <a href="/?lang=${lang}" class="text-xl font-bold text-gray-900">
                        ${t('platform.name', lang)}
                    </a>
                    <div class="flex items-center space-x-4">
                        <a href="/?lang=${lang}" class="text-gray-600 hover:text-gray-900">${t('nav.home', lang)}</a>
                        <a href="/projects?lang=${lang}" class="text-gray-600 hover:text-gray-900">${t('nav.find_projects', lang)}</a>
                        <a href="/freelancers?lang=${lang}" class="text-gray-600 hover:text-gray-900">${t('nav.find_experts', lang)}</a>
                        <a href="/categories?lang=${lang}" class="text-gray-900 font-semibold">${t('nav.categories', lang)}</a>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-6">
                <i class="fas fa-th-large mr-3"></i>
                ${t('nav.categories', lang)}
            </h1>
            
            <div id="categoriesContainer" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="text-center py-12 col-span-full">
                    <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
                    <p class="mt-4 text-gray-500">${lang === 'ko' ? '로딩 중...' : 'Loading...'}</p>
                </div>
            </div>
        </div>

        <script>
            const lang = new URLSearchParams(window.location.search).get('lang') || 'ko';
            
            async function loadCategories() {
                try {
                    const response = await fetch('/api/categories');
                    const data = await response.json();
                    
                    const container = document.getElementById('categoriesContainer');
                    
                    if (!data.success || !data.data || data.data.length === 0) {
                        container.innerHTML = \`
                            <div class="text-center py-12 col-span-full">
                                <i class="fas fa-inbox text-6xl text-gray-300"></i>
                                <p class="mt-4 text-gray-500">\${lang === 'ko' ? '카테고리가 없습니다' : 'No categories found'}</p>
                            </div>
                        \`;
                        return;
                    }
                    
                    container.innerHTML = data.data.map(category => \`
                        <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                            <div class="flex items-center mb-4">
                                <div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-2xl">
                                    <i class="fas fa-folder text-blue-600"></i>
                                </div>
                                <h3 class="ml-4 text-lg font-semibold text-gray-900">\${category.name}</h3>
                            </div>
                            
                            \${category.children && category.children.length > 0 ? \`
                                <div class="space-y-2">
                                    \${category.children.slice(0, 5).map(child => \`
                                        <div class="flex items-center text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
                                            <i class="fas fa-chevron-right text-xs mr-2"></i>
                                            <span>\${child.name}</span>
                                        </div>
                                    \`).join('')}
                                    \${category.children.length > 5 ? \`
                                        <div class="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                                            + \${category.children.length - 5} \${lang === 'ko' ? '개 더보기' : 'more'}
                                        </div>
                                    \` : ''}
                                </div>
                            \` : \`
                                <p class="text-sm text-gray-500">\${category.description || (lang === 'ko' ? '하위 카테고리가 없습니다' : 'No subcategories')}</p>
                            \`}
                        </div>
                    \`).join('');
                } catch (error) {
                    console.error('Error loading categories:', error);
                    document.getElementById('categoriesContainer').innerHTML = \`
                        <div class="text-center py-12 col-span-full">
                            <i class="fas fa-exclamation-triangle text-6xl text-red-300"></i>
                            <p class="mt-4 text-red-500">\${lang === 'ko' ? '카테고리를 불러오는데 실패했습니다' : 'Failed to load categories'}</p>
                        </div>
                    \`;
                }
            }
            
            loadCategories();
        </script>
    </body>
    </html>
  `);
})

// Freelancers page
app.get('/freelancers', async (c) => {
  const lang = getLanguageFromRequest(c.req.raw);
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${t('nav.find_experts', lang)} - ${t('platform.name', lang)}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap');
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Noto Sans KR', sans-serif;
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <nav class="bg-white shadow-sm sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <a href="/?lang=${lang}" class="text-xl font-bold text-gray-900">
                        ${t('platform.name', lang)}
                    </a>
                    <div class="flex items-center space-x-4">
                        <a href="/?lang=${lang}" class="text-gray-600 hover:text-gray-900">${t('nav.home', lang)}</a>
                        <a href="/projects?lang=${lang}" class="text-gray-600 hover:text-gray-900">${t('nav.find_projects', lang)}</a>
                        <a href="/freelancers?lang=${lang}" class="text-gray-900 font-semibold">${t('nav.find_experts', lang)}</a>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-6">
                <i class="fas fa-users mr-3"></i>
                ${t('nav.find_experts', lang)}
            </h1>
            
            <div id="freelancersContainer" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="text-center py-12 col-span-full">
                    <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
                    <p class="mt-4 text-gray-500">${lang === 'ko' ? '로딩 중...' : 'Loading...'}</p>
                </div>
            </div>
            
            <div id="pagination" class="mt-8 flex justify-center"></div>
        </div>

        <script>
            const lang = new URLSearchParams(window.location.search).get('lang') || 'ko';
            let currentPage = 1;
            
            async function loadFreelancers(page = 1) {
                try {
                    const response = await fetch(\`/api/freelancers?page=\${page}&limit=12\`);
                    const data = await response.json();
                    
                    const container = document.getElementById('freelancersContainer');
                    
                    if (!data.success || !data.data || data.data.length === 0) {
                        container.innerHTML = \`
                            <div class="text-center py-12 col-span-full">
                                <i class="fas fa-inbox text-6xl text-gray-300"></i>
                                <p class="mt-4 text-gray-500">\${lang === 'ko' ? '전문가가 없습니다' : 'No freelancers found'}</p>
                            </div>
                        \`;
                        return;
                    }
                    
                    container.innerHTML = data.data.map(freelancer => \`
                        <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                            <div class="flex items-start mb-4">
                                <div class="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                                    \${freelancer.profile_photo_url ? \`<img src="\${freelancer.profile_photo_url}" class="w-16 h-16 rounded-full object-cover" />\` : '<i class="fas fa-user text-gray-400"></i>'}
                                </div>
                                <div class="ml-4 flex-1">
                                    <h3 class="text-lg font-semibold text-gray-900">\${freelancer.nickname || 'Freelancer'}</h3>
                                    <p class="text-sm text-gray-500">\${freelancer.country || ''}</p>
                                    <div class="flex items-center mt-1">
                                        <span class="text-yellow-400">★</span>
                                        <span class="ml-1 text-sm font-semibold">\${freelancer.average_rating || 0}</span>
                                        <span class="ml-2 text-sm text-gray-500">(\${freelancer.completed_projects || 0} \${lang === 'ko' ? '프로젝트' : 'projects'})</span>
                                    </div>
                                </div>
                            </div>
                            <p class="text-gray-600 text-sm mb-4 line-clamp-2">\${freelancer.bio || (lang === 'ko' ? '자기소개가 없습니다' : 'No bio available')}</p>
                            <div class="flex flex-wrap gap-2 mb-4">
                                \${freelancer.skills ? freelancer.skills.split(',').slice(0, 3).map(skill => \`
                                    <span class="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">\${skill.trim()}</span>
                                \`).join('') : ''}
                            </div>
                            <a href="/freelancers/\${freelancer.id}?lang=\${lang}" class="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition">
                                \${lang === 'ko' ? '프로필 보기' : 'View Profile'}
                            </a>
                        </div>
                    \`).join('');
                    
                    // Pagination
                    if (data.total_pages > 1) {
                        const pagination = document.getElementById('pagination');
                        let paginationHTML = '';
                        
                        for (let i = 1; i <= data.total_pages; i++) {
                            paginationHTML += \`
                                <button 
                                    onclick="loadFreelancers(\${i})" 
                                    class="mx-1 px-4 py-2 rounded \${i === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}"
                                >
                                    \${i}
                                </button>
                            \`;
                        }
                        
                        pagination.innerHTML = paginationHTML;
                    }
                } catch (error) {
                    console.error('Error loading freelancers:', error);
                    document.getElementById('freelancersContainer').innerHTML = \`
                        <div class="text-center py-12 col-span-full">
                            <i class="fas fa-exclamation-triangle text-6xl text-red-300"></i>
                            <p class="mt-4 text-red-500">\${lang === 'ko' ? '전문가를 불러오는데 실패했습니다' : 'Failed to load freelancers'}</p>
                        </div>
                    \`;
                }
            }
            
            // Load freelancers on page load
            loadFreelancers();
        </script>
    </body>
    </html>
  `);
})

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
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap');
          
          :root {
            --ivory-white: #FAFAF7;
            --charcoal-black: #1C1C1E;
            --warm-gray: #6E6E73;
            --deep-navy: #0B1C2D;
            --accent-gold: #D4AF37;
          }
          
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Noto Sans KR', 'Noto Sans JP', 'Noto Sans SC', sans-serif;
            background-color: var(--ivory-white);
            color: var(--charcoal-black);
            letter-spacing: -0.01em;
          }
          
          .hero-gradient {
            background: linear-gradient(135deg, var(--deep-navy) 0%, #1a2c3d 100%);
          }
          
          .card-hover {
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
          
          .card-hover:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
          }
          
          .btn-primary {
            background: var(--deep-navy);
            color: white;
            transition: all 0.3s ease;
            box-shadow: 0 4px 14px rgba(11, 28, 45, 0.25);
          }
          
          .btn-primary:hover {
            background: #0f2338;
            box-shadow: 0 6px 20px rgba(11, 28, 45, 0.35);
            transform: translateY(-2px);
          }
          
          .btn-secondary {
            background: white;
            color: var(--charcoal-black);
            border: 1px solid #e5e5e5;
            transition: all 0.3s ease;
          }
          
          .btn-secondary:hover {
            background: #f8f8f8;
            border-color: var(--warm-gray);
          }
          
          .glass-effect {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
          }
          
          .nav-link {
            color: var(--warm-gray);
            transition: color 0.2s ease;
            font-weight: 500;
            font-size: 15px;
          }
          
          .nav-link:hover {
            color: var(--charcoal-black);
          }
          
          .feature-card {
            background: white;
            border: 1px solid rgba(0, 0, 0, 0.06);
            border-radius: 16px;
            padding: 32px;
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
          
          @media (max-width: 768px) {
            .feature-card {
              padding: 12px !important;
              border-radius: 12px;
            }
          }
          
          .feature-card:hover {
            border-color: rgba(0, 0, 0, 0.12);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
          }
          
          h1, h2, h3 {
            letter-spacing: -0.02em;
          }
          
          .text-luxury {
            color: var(--charcoal-black);
            font-weight: 600;
          }
          
          .text-sub {
            color: var(--warm-gray);
          }
          

        </style>
    </head>
    <body>
        <!-- Navigation -->
        <nav class="glass-effect sticky top-0 z-50 border-b border-gray-200" style="border-bottom: 1px solid rgba(0,0,0,0.06);">
            <div class="max-w-7xl mx-auto px-4 lg:px-8">
                <div class="flex items-center h-16 md:h-20">
                    <a href="/?lang=${lang}" class="text-xl md:text-2xl font-semibold text-luxury tracking-tight mr-6">
                        ${t('platform.name', lang)}
                    </a>
                    
                    <div class="flex items-center space-x-4 md:space-x-8 text-sm md:text-base">
                        <a href="/?lang=${lang}" class="nav-link hidden md:block">${t('nav.home', lang)}</a>
                        <a href="/projects?lang=${lang}" class="nav-link">${t('nav.find_projects', lang)}</a>
                        <a href="/freelancers?lang=${lang}" class="nav-link">${t('nav.find_experts', lang)}</a>
                        <a href="/categories?lang=${lang}" class="nav-link">${t('nav.categories', lang)}</a>
                    </div>
                    
                    <div class="flex items-center space-x-2 md:space-x-3 ml-auto">
                        <button onclick="showRegister()" class="btn-secondary px-3 py-1.5 md:px-5 md:py-2 rounded-full font-medium text-xs md:text-sm whitespace-nowrap">
                            ${t('auth.register', lang)}
                        </button>
                        <button onclick="showLogin()" class="btn-primary px-3 py-1.5 md:px-5 md:py-2 rounded-full font-medium text-xs md:text-sm whitespace-nowrap">
                            ${t('auth.login', lang)}
                        </button>
                        <button onclick="showNotices()" class="nav-link p-2 hover:bg-gray-50 rounded-lg transition">
                            <i class="fas fa-bell text-sm md:text-base"></i>
                        </button>
                        <select onchange="changeLang(this.value)" class="px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm rounded-lg bg-gray-700 text-white border-none hover:bg-gray-600 focus:outline-none cursor-pointer font-medium">
                            <option value="ko" ${lang === 'ko' ? 'selected' : ''}>🇰🇷</option>
                            <option value="en" ${lang === 'en' ? 'selected' : ''}>🇺🇸</option>
                            <option value="zh" ${lang === 'zh' ? 'selected' : ''}>🇨🇳</option>
                            <option value="ja" ${lang === 'ja' ? 'selected' : ''}>🇯🇵</option>
                            <option value="vi" ${lang === 'vi' ? 'selected' : ''}>🇻🇳</option>
                            <option value="th" ${lang === 'th' ? 'selected' : ''}>🇹🇭</option>
                            <option value="es" ${lang === 'es' ? 'selected' : ''}>🇪🇸</option>
                            <option value="de" ${lang === 'de' ? 'selected' : ''}>🇩🇪</option>
                        </select>
                    </div>
                    
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <div class="hero-gradient text-white py-6 md:py-20">
            <div class="max-w-6xl mx-auto px-6 lg:px-8 text-center">
                <h1 class="hero-title text-base sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-4 md:mb-8 leading-tight tracking-tight whitespace-nowrap">
                    ${lang === 'ko' ? '수수료 제로, 프리랜서 플랫폼의 새로운 기준' : t('platform.tagline', lang)}
                </h1>
                <div class="inline-flex items-center space-x-1 md:space-x-2 bg-white bg-opacity-10 backdrop-blur-sm rounded-full px-2 md:px-4 py-1 md:py-2 mb-2 md:mb-4">
                    <i class="fab fa-bitcoin text-sm md:text-base"></i>
                    <p class="hero-subtitle text-xs md:text-sm font-medium">
                        ${lang === 'ko' ? '모든 거래는 테더 USDT' : lang === 'en' ? 'All Transactions in Tether USDT' : lang === 'zh' ? '所有交易均使用泰达币USDT' : lang === 'ja' ? 'すべての取引はテザーUSDT' : lang === 'vi' ? 'Tất cả giao dịch bằng Tether USDT' : lang === 'th' ? 'ธุรกรรมทั้งหมดด้วย Tether USDT' : lang === 'es' ? 'Todas las transacciones en Tether USDT' : 'Alle Transaktionen in Tether USDT'}
                    </p>
                </div>
                <p class="hero-subtitle text-sm md:text-base mb-2 md:mb-4 font-light opacity-95">${t('platform.fee_policy', lang)}</p>
                <p class="hero-description text-xs md:text-sm mb-4 md:mb-8 opacity-80 max-w-3xl mx-auto leading-relaxed">
                    <span class="block sm:inline">${lang === 'ko' ? '전 세계 의뢰인과 개발자를 ' : t('platform.global_description', lang)}</span>
                    <span class="block sm:inline">${lang === 'ko' ? '연결하는 글로벌 플랫폼' : ''}</span>
                </p>
                <div class="hero-buttons flex flex-col sm:flex-row justify-center gap-2 md:gap-3 items-center max-w-xs mx-auto sm:max-w-none">
                    <button onclick="showProjectForm()" class="btn-secondary w-full sm:w-auto px-3 md:px-7 py-2 md:py-3 rounded-full font-medium text-xs md:text-base hover:scale-105 transition-transform" style="min-height: 40px;">
                        ${t('nav.find_projects', lang)}
                    </button>
                    <button onclick="showFreelancerForm()" class="bg-white text-gray-900 w-full sm:w-auto px-3 md:px-7 py-2 md:py-3 rounded-full font-medium text-xs md:text-base hover:scale-105 transition-transform shadow-lg" style="min-height: 40px;">
                        ${t('nav.find_experts', lang)}
                    </button>
                </div>
            </div>
        </div>

        <!-- Features Section -->
        <div class="max-w-7xl mx-auto px-4 lg:px-8 py-8 md:py-24">
            <h2 class="text-xl md:text-5xl font-semibold text-center mb-2 md:mb-4 text-luxury">
                ${t('footer.why_choose', lang)}
            </h2>
            <p class="text-center text-sub text-xs md:text-lg mb-6 md:mb-16 max-w-2xl mx-auto">
                ${lang === 'ko' ? '프리미엄 프리랜서 플랫폼의 새로운 기준' : lang === 'en' ? 'A new standard for premium freelance platforms' : lang === 'zh' ? '高级自由职业平台的新标准' : lang === 'ja' ? 'プレミアムフリーランスプラットフォームの新基準' : 'A new standard for premium freelance platforms'}
            </p>
            
            <div class="grid md:grid-cols-3 gap-3 md:gap-8">
                <div class="feature-card text-center card-hover">
                    <div class="text-2xl md:text-5xl mb-2 md:mb-6" style="color: var(--deep-navy);">
                        <i class="fas fa-percentage"></i>
                    </div>
                    <h3 class="text-sm md:text-2xl font-semibold mb-2 md:mb-4 text-luxury">
                        ${t('feature.lowest_fees', lang)}
                    </h3>
                    <p class="text-sub text-xs md:text-base leading-relaxed">
                        ${t('feature.lowest_fees_desc', lang)}
                    </p>
                </div>
                
                <div class="feature-card text-center card-hover">
                    <div class="text-2xl md:text-5xl mb-2 md:mb-6" style="color: #D4AF37;">
                        <i class="fab fa-bitcoin"></i>
                    </div>
                    <h3 class="text-sm md:text-2xl font-semibold mb-2 md:mb-4 text-luxury">
                        ${t('feature.usdt_payment', lang)}
                    </h3>
                    <p class="text-sub text-xs md:text-base leading-relaxed">
                        ${t('feature.usdt_payment_desc', lang)}
                    </p>
                </div>
                
                <div class="feature-card text-center card-hover">
                    <div class="text-2xl md:text-5xl mb-2 md:mb-6" style="color: var(--deep-navy);">
                        <i class="fas fa-globe"></i>
                    </div>
                    <h3 class="text-sm md:text-2xl font-semibold mb-2 md:mb-4 text-luxury">
                        ${t('feature.global_network', lang)}
                    </h3>
                    <p class="text-sub text-xs md:text-base leading-relaxed">
                        ${t('feature.global_network_desc', lang)}
                    </p>
                </div>
            </div>
        </div>

        <!-- Core Differentiators Section -->
        <div class="py-8 md:py-24" style="background: linear-gradient(180deg, #FAFAF7 0%, #F5F5F2 100%);">
            <div class="max-w-7xl mx-auto px-4 lg:px-8">
                <h2 class="text-lg md:text-5xl font-semibold text-center mb-2 md:mb-4 text-luxury">
                    ${lang === 'ko' ? '위시캣·프리모아 단점을 해결하는 핵심 기능' : 
                      lang === 'en' ? 'Core Features Solving Wishket·Freemoa Issues' :
                      lang === 'zh' ? '解决Wishket·Freemoa缺点的核心功能' :
                      lang === 'ja' ? 'Wishket·Fremoaの欠点を解決する核心機能' :
                      lang === 'vi' ? 'Tính năng cốt lõi giải quyết vấn đề Wishket·Freemoa' :
                      lang === 'th' ? 'ฟีเจอร์หลักแก้ปัญหา Wishket·Freemoa' :
                      lang === 'es' ? 'Características principales que resuelven problemas de Wishket·Freemoa' :
                      'Kernfunktionen zur Lösung von Wishket·Freemoa-Problemen'}
                </h2>
                <p class="text-center text-sub text-xs md:text-lg mb-4 md:mb-16 max-w-3xl mx-auto leading-relaxed hidden sm:block">
                    ${lang === 'ko' ? '기존 플랫폼은 "사람 중심 중개", FeeZero는 "시스템 중심 프로젝트 관리"' : 
                      lang === 'en' ? 'Existing platforms: "People-centered brokerage", FeeZero: "System-centered project management"' :
                      lang === 'zh' ? '现有平台："以人为中心的中介"，FeeZero："以系统为中心的项目管理"' :
                      lang === 'ja' ? '既存プラットフォーム：「人中心の仲介」、FeeZero：「システム中心のプロジェクト管理」' :
                      lang === 'vi' ? 'Nền tảng hiện có: "Môi giới tập trung vào con người", FeeZero: "Quản lý dự án tập trung vào hệ thống"' :
                      lang === 'th' ? 'แพลตฟอร์มที่มีอยู่: "นายหน้าเน้นคน" FeeZero: "การจัดการโครงการเน้นระบบ"' :
                      lang === 'es' ? 'Plataformas existentes: "Intermediación centrada en personas", FeeZero: "Gestión de proyectos centrada en el sistema"' :
                      'Bestehende Plattformen: "Personenzentrierte Vermittlung", FeeZero: "Systemzentriertes Projektmanagement"'}
                </p>
                
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-8">
                    <!-- Feature 1: AI-based Standard Quotation -->
                    <div class="feature-card card-hover">
                        <div class="flex items-center mb-3 md:mb-5">
                            <div class="text-2xl md:text-4xl mr-3 md:mr-4" style="color: var(--deep-navy);">
                                <i class="fas fa-calculator"></i>
                            </div>
                            <h3 class="text-base md:text-xl font-semibold text-luxury">
                                ${lang === 'ko' ? 'AI 기반 표준 견적' : 
                                  lang === 'en' ? 'AI-based Standard Quotation' :
                                  lang === 'zh' ? 'AI标准报价' :
                                  lang === 'ja' ? 'AI標準見積' :
                                  lang === 'vi' ? 'Báo giá tiêu chuẩn AI' :
                                  lang === 'th' ? 'ใบเสนอราคามาตรฐาน AI' :
                                  lang === 'es' ? 'Cotización estándar basada en IA' :
                                  'AI-basiertes Standardangebot'}
                            </h3>
                        </div>
                        <p class="text-sub text-base leading-relaxed">
                            ${lang === 'ko' ? '기능 수 자동 분해, 기술 스택별 난이도 점수화, 예상 개발 기간 자동 산출로 투명한 가격 책정' : 
                              lang === 'en' ? 'Automatic feature breakdown, tech stack difficulty scoring, auto development timeline for transparent pricing' :
                              lang === 'zh' ? '自动功能分解，技术栈难度评分，自动开发时间计算，透明定价' :
                              lang === 'ja' ? '機能の自動分解、技術スタック難易度スコアリング、開発期間自動算出で透明な価格設定' :
                              lang === 'vi' ? 'Phân tích tính năng tự động, chấm điểm độ khó công nghệ, tính thời gian phát triển tự động cho giá minh bạch' :
                              lang === 'th' ? 'แยกฟีเจอร์อัตโนมัติ คะแนนความยากของเทคโนโลยี คำนวณระยะเวลาพัฒนาอัตโนมัติเพื่อราคาโปร่งใส' :
                              lang === 'es' ? 'Desglose automático de características, puntuación de dificultad de stack tecnológico, cálculo automático de tiempo de desarrollo para precios transparentes' :
                              'Automatische Funktionsaufschlüsselung, Tech-Stack-Schwierigkeitsbewertung, automatische Entwicklungszeit für transparente Preisgestaltung'}
                        </p>
                    </div>

                    <!-- Feature 2: Success Criteria Definition -->
                    <div class="feature-card card-hover">
                        <div class="flex items-center mb-5">
                            <div class="text-2xl md:text-4xl mr-3 md:mr-4" style="color: #2D7A3E;">
                                <i class="fas fa-check-double"></i>
                            </div>
                            <h3 class="text-base md:text-xl font-semibold text-luxury">
                                ${lang === 'ko' ? '성공 기준 자동 정의' : 
                                  lang === 'en' ? 'Auto Success Criteria' :
                                  lang === 'zh' ? '自动成功标准' :
                                  lang === 'ja' ? '成功基準自動定義' :
                                  lang === 'vi' ? 'Tiêu chí thành công tự động' :
                                  lang === 'th' ? 'เกณฑ์ความสำเร็จอัตโนมัติ' :
                                  lang === 'es' ? 'Criterios de éxito automáticos' :
                                  'Automatische Erfolgskriterien'}
                            </h3>
                        </div>
                        <p class="text-sub text-base leading-relaxed">
                            ${lang === 'ko' ? '개발 완료 기준 자동 체크리스트, 기능별 완료 조건 명문화로 분쟁 70% 차단' : 
                              lang === 'en' ? 'Auto completion checklist, documented completion conditions to prevent 70% of disputes' :
                              lang === 'zh' ? '自动完成检查表，明确的完成条件可防止70%的纠纷' :
                              lang === 'ja' ? '開発完了基準自動チェックリスト、機能別完了条件明文化で紛争70%防止' :
                              lang === 'vi' ? 'Danh sách kiểm tra hoàn thành tự động, điều kiện hoàn thành được ghi chép để ngăn chặn 70% tranh chấp' :
                              lang === 'th' ? 'รายการตรวจสอบการเสร็จสิ้นอัตโนมัติ เงื่อนไขการเสร็จสิ้นที่ระบุไว้เพื่อป้องกันข้อพิพาท 70%' :
                              lang === 'es' ? 'Lista de verificación de finalización automática, condiciones de finalización documentadas para prevenir el 70% de disputas' :
                              'Automatische Fertigstellungs-Checkliste, dokumentierte Fertigstellungsbedingungen zur Vermeidung von 70% der Streitigkeiten'}
                        </p>
                    </div>

                    <!-- Feature 3: Milestone Escrow -->
                    <div class="feature-card card-hover">
                        <div class="flex items-center mb-5">
                            <div class="text-2xl md:text-4xl mr-3 md:mr-4" style="color: var(--deep-navy);">
                                <i class="fas fa-lock"></i>
                            </div>
                            <h3 class="text-base md:text-xl font-semibold text-luxury">
                                ${lang === 'ko' ? '마일스톤 에스크로' : 
                                  lang === 'en' ? 'Milestone Escrow' :
                                  lang === 'zh' ? '里程碑托管' :
                                  lang === 'ja' ? 'マイルストーンエスクロー' :
                                  lang === 'vi' ? 'Ký quỹ theo mốc' :
                                  lang === 'th' ? 'เอสโครว์ไมล์สโตน' :
                                  lang === 'es' ? 'Depósito en garantía por hitos' :
                                  'Meilenstein-Treuhand'}
                            </h3>
                        </div>
                        <p class="text-sub text-base leading-relaxed">
                            ${lang === 'ko' ? '단계별 분할 에스크로로 개발자·클라이언트 모두 리스크 감소, 미이행 시 자동 환불' : 
                              lang === 'en' ? 'Phased escrow reduces risk for both parties, automatic refund on non-performance' :
                              lang === 'zh' ? '分阶段托管降低双方风险，未履行时自动退款' :
                              lang === 'ja' ? '段階別分割エスクローで開発者・クライアント双方のリスク削減、未履行時自動返金' :
                              lang === 'vi' ? 'Ký quỹ theo giai đoạn giảm rủi ro cho cả hai bên, hoàn tiền tự động khi không thực hiện' :
                              lang === 'th' ? 'เอสโครว์แบ่งระยะลดความเสี่ยงสำหรับทั้งสองฝ่าย คืนเงินอัตโนมัติเมื่อไม่ปฏิบัติตาม' :
                              lang === 'es' ? 'El depósito en garantía por fases reduce el riesgo para ambas partes, reembolso automático en caso de incumplimiento' :
                              'Phasenweise Treuhand reduziert Risiken für beide Parteien, automatische Rückerstattung bei Nichterfüllung'}
                        </p>
                    </div>

                    <!-- Feature 4: Trust Score System -->
                    <div class="feature-card card-hover">
                        <div class="flex items-center mb-5">
                            <div class="text-2xl md:text-4xl mr-3 md:mr-4" style="color: #D4AF37;">
                                <i class="fas fa-star"></i>
                            </div>
                            <h3 class="text-base md:text-xl font-semibold text-luxury">
                                ${lang === 'ko' ? '실전 검증 신뢰지수' : 
                                  lang === 'en' ? 'Verified Trust Score' :
                                  lang === 'zh' ? '实战验证信任指数' :
                                  lang === 'ja' ? '実戦検証信頼指数' :
                                  lang === 'vi' ? 'Chỉ số tin cậy đã xác minh' :
                                  lang === 'th' ? 'คะแนนความน่าเชื่อถือที่ตรวจสอบแล้ว' :
                                  lang === 'es' ? 'Índice de confianza verificado' :
                                  'Verifizierter Vertrauens-Score'}
                            </h3>
                        </div>
                        <p class="text-sub text-base leading-relaxed">
                            ${lang === 'ko' ? '포트폴리오가 아닌 완료율, 일정 준수율, 재의뢰율 등 정량 지표로 실력 검증' : 
                              lang === 'en' ? 'Skill verification through quantitative metrics like completion rate, schedule adherence, re-hire rate, not portfolios' :
                              lang === 'zh' ? '通过完成率、时间表遵守率、重新雇佣率等定量指标验证技能，而非作品集' :
                              lang === 'ja' ? 'ポートフォリオではなく完了率、スケジュール遵守率、再依頼率等の定量指標でスキル検証' :
                              lang === 'vi' ? 'Xác minh kỹ năng thông qua các chỉ số định lượng như tỷ lệ hoàn thành, tuân thủ lịch trình, tỷ lệ thuê lại, không phải portfolio' :
                              lang === 'th' ? 'การตรวจสอบทักษะผ่านตัวชี้วัดเชิงปริมาณเช่นอัตราการเสร็จสิ้น การปฏิบัติตามตารางเวลา อัตราการจ้างซ้ำ ไม่ใช่พอร์ตโฟลิโอ' :
                              lang === 'es' ? 'Verificación de habilidades a través de métricas cuantitativas como tasa de finalización, cumplimiento de plazos, tasa de recontratación, no portafolios' :
                              'Kompetenzverifizierung durch quantitative Metriken wie Abschlussrate, Zeitplaneinhaltung, Wiedereinstellungsrate, nicht Portfolios'}
                        </p>
                    </div>

                    <!-- Feature 5: AI PM Assistant -->
                    <div class="feature-card card-hover">
                        <div class="flex items-center mb-5">
                            <div class="text-2xl md:text-4xl mr-3 md:mr-4" style="color: var(--deep-navy);">
                                <i class="fas fa-robot"></i>
                            </div>
                            <h3 class="text-base md:text-xl font-semibold text-luxury">
                                ${lang === 'ko' ? 'AI PM 보조 시스템' : 
                                  lang === 'en' ? 'AI PM Assistant' :
                                  lang === 'zh' ? 'AI项目经理助手' :
                                  lang === 'ja' ? 'AI PMアシスタント' :
                                  lang === 'vi' ? 'Trợ lý PM AI' :
                                  lang === 'th' ? 'ผู้ช่วย PM AI' :
                                  lang === 'es' ? 'Asistente PM de IA' :
                                  'KI-PM-Assistent'}
                            </h3>
                        </div>
                        <p class="text-sub text-base leading-relaxed">
                            ${lang === 'ko' ? '일정 지연 감지, 요구사항 변경 로그 자동 기록, 주간 리포트 자동 생성으로 품질 관리' : 
                              lang === 'en' ? 'Schedule delay detection, auto requirement change log, weekly report generation for quality management' :
                              lang === 'zh' ? '时间表延迟检测，自动需求变更日志，每周报告生成以进行质量管理' :
                              lang === 'ja' ? 'スケジュール遅延検知、要求変更ログ自動記録、週次レポート自動生成で品質管理' :
                              lang === 'vi' ? 'Phát hiện chậm trễ lịch trình, ghi nhật ký thay đổi yêu cầu tự động, tạo báo cáo hàng tuần để quản lý chất lượng' :
                              lang === 'th' ? 'ตรวจจับความล่าช้าของกำหนดการ บันทึกการเปลี่ยนแปลงความต้องการอัตโนมัติ สร้างรายงานรายสัปดาห์เพื่อการจัดการคุณภาพ' :
                              lang === 'es' ? 'Detección de retrasos en el cronograma, registro automático de cambios de requisitos, generación de informes semanales para gestión de calidad' :
                              'Erkennung von Zeitplanverzögerungen, automatisches Anforderungsänderungsprotokoll, wöchentliche Berichtserstellung für Qualitätsmanagement'}
                        </p>
                    </div>

                    <!-- Feature 6: Intermediate Deliverables -->
                    <div class="feature-card card-hover">
                        <div class="flex items-center mb-5">
                            <div class="text-2xl md:text-4xl mr-3 md:mr-4" style="color: var(--deep-navy);">
                                <i class="fas fa-code-branch"></i>
                            </div>
                            <h3 class="text-base md:text-xl font-semibold text-luxury">
                                ${lang === 'ko' ? '중간 결과물 제출' : 
                                  lang === 'en' ? 'Intermediate Deliverables' :
                                  lang === 'zh' ? '中间交付物' :
                                  lang === 'ja' ? '中間成果物提出' :
                                  lang === 'vi' ? 'Sản phẩm trung gian' :
                                  lang === 'th' ? 'ผลงานระหว่างกาล' :
                                  lang === 'es' ? 'Entregables intermedios' :
                                  'Zwischenergebnisse'}
                            </h3>
                        </div>
                        <p class="text-sub text-base leading-relaxed">
                            ${lang === 'ko' ? 'Git/배포 링크 제출 의무화, 테스트 서버 접속 권한 공유로 블랙박스 개발 방지' : 
                              lang === 'en' ? 'Mandatory Git/deployment link submission, test server access sharing to prevent black-box development' :
                              lang === 'zh' ? '强制提交Git/部署链接，共享测试服务器访问权限以防止黑箱开发' :
                              lang === 'ja' ? 'Git/デプロイリンク提出義務化、テストサーバーアクセス権共有でブラックボックス開発防止' :
                              lang === 'vi' ? 'Bắt buộc gửi liên kết Git/triển khai, chia sẻ quyền truy cập máy chủ thử nghiệm để ngăn chặn phát triển hộp đen' :
                              lang === 'th' ? 'บังคับส่งลิงก์ Git/การปรับใช้ แบ่งปันการเข้าถึงเซิร์ฟเวอร์ทดสอบเพื่อป้องกันการพัฒนาแบบกล่องดำ' :
                              lang === 'es' ? 'Envío obligatorio de enlaces Git/implementación, compartir acceso al servidor de prueba para prevenir desarrollo de caja negra' :
                              'Verpflichtende Git/Deployment-Link-Einreichung, Testserver-Zugriff teilen um Black-Box-Entwicklung zu verhindern'}
                        </p>
                    </div>

                    <!-- Feature 7: Delay Penalty System -->
                    <div class="feature-card card-hover">
                        <div class="flex items-center mb-5">
                            <div class="text-2xl md:text-4xl mr-3 md:mr-4" style="color: #FF6B35;">
                                <i class="fas fa-clock"></i>
                            </div>
                            <h3 class="text-base md:text-xl font-semibold text-luxury">
                                ${lang === 'ko' ? '일정 지연 패널티' : 
                                  lang === 'en' ? 'Delay Penalty System' :
                                  lang === 'zh' ? '延迟惩罚系统' :
                                  lang === 'ja' ? 'スケジュール遅延ペナルティ' :
                                  lang === 'vi' ? 'Hệ thống phạt chậm trễ' :
                                  lang === 'th' ? 'ระบบลงโทษความล่าช้า' :
                                  lang === 'es' ? 'Sistema de penalización por retrasos' :
                                  'Verzögerungs-Strafsystem'}
                            </h3>
                        </div>
                        <p class="text-sub text-base leading-relaxed">
                            ${lang === 'ko' ? '지연 일수 자동 계산, 수수료 차감 or 클라이언트 보상으로 일정 준수 유도' : 
                              lang === 'en' ? 'Auto delay calculation, fee deduction or client compensation to encourage schedule adherence' :
                              lang === 'zh' ? '自动计算延迟天数，扣除费用或补偿客户以鼓励遵守时间表' :
                              lang === 'ja' ? '遅延日数自動計算、手数料差引またはクライアント補償でスケジュール遵守誘導' :
                              lang === 'vi' ? 'Tính toán chậm trễ tự động, khấu trừ phí hoặc bồi thường khách hàng để khuyến khích tuân thủ lịch trình' :
                              lang === 'th' ? 'คำนวณความล่าช้าอัตโนมัติ หักค่าธรรมเนียมหรือชดเชยลูกค้าเพื่อส่งเสริมการปฏิบัติตามตารางเวลา' :
                              lang === 'es' ? 'Cálculo automático de retrasos, deducción de tarifas o compensación al cliente para fomentar el cumplimiento del cronograma' :
                              'Automatische Verzögerungsberechnung, Gebührenabzug oder Kundenkompensation zur Förderung der Zeitplaneinhaltung'}
                        </p>
                    </div>

                    <!-- Feature 8: Requirement Translator -->
                    <div class="feature-card card-hover">
                        <div class="flex items-center mb-5">
                            <div class="text-2xl md:text-4xl mr-3 md:mr-4" style="color: #14B8A6;">
                                <i class="fas fa-language"></i>
                            </div>
                            <h3 class="text-base md:text-xl font-semibold text-luxury">
                                ${lang === 'ko' ? '요구사항 자동 변환' : 
                                  lang === 'en' ? 'Requirement Translator' :
                                  lang === 'zh' ? '需求自动转换' :
                                  lang === 'ja' ? '要求仕様自動変換' :
                                  lang === 'vi' ? 'Dịch yêu cầu tự động' :
                                  lang === 'th' ? 'แปลความต้องการอัตโนมัติ' :
                                  lang === 'es' ? 'Traductor de requisitos' :
                                  'Anforderungs-Übersetzer'}
                            </h3>
                        </div>
                        <p class="text-sub text-base leading-relaxed">
                            ${lang === 'ko' ? '자연어를 개발 요구사항으로 변환하는 AI로 기술 비전문가도 정확한 의뢰 가능' : 
                              lang === 'en' ? 'AI converts natural language to development requirements so non-technical clients can request accurately' :
                              lang === 'zh' ? 'AI将自然语言转换为开发需求，使非技术客户也能准确请求' :
                              lang === 'ja' ? '自然言語を開発要求仕様に変換するAIで技術非専門家も正確な依頼可能' :
                              lang === 'vi' ? 'AI chuyển đổi ngôn ngữ tự nhiên thành yêu cầu phát triển để khách hàng phi kỹ thuật có thể yêu cầu chính xác' :
                              lang === 'th' ? 'AI แปลภาษาธรรมชาติเป็นความต้องการพัฒนาเพื่อให้ลูกค้าที่ไม่ใช่ทางเทคนิคสามารถขอได้อย่างถูกต้อง' :
                              lang === 'es' ? 'La IA convierte el lenguaje natural en requisitos de desarrollo para que los clientes no técnicos puedan solicitar con precisión' :
                              'KI wandelt natürliche Sprache in Entwicklungsanforderungen um, damit auch nicht-technische Kunden präzise anfragen können'}
                        </p>
                    </div>

                    <!-- Feature 9: Project Insurance -->
                    <div class="feature-card card-hover">
                        <div class="flex items-center mb-5">
                            <div class="text-2xl md:text-4xl mr-3 md:mr-4" style="color: #EC4899;">
                                <i class="fas fa-shield-alt"></i>
                            </div>
                            <h3 class="text-base md:text-xl font-semibold text-luxury">
                                ${lang === 'ko' ? '프로젝트 성공 보증' : 
                                  lang === 'en' ? 'Project Success Guarantee' :
                                  lang === 'zh' ? '项目成功保证' :
                                  lang === 'ja' ? 'プロジェクト成功保証' :
                                  lang === 'vi' ? 'Bảo đảm thành công dự án' :
                                  lang === 'th' ? 'การรับประกันความสำเร็จของโครงการ' :
                                  lang === 'es' ? 'Garantía de éxito del proyecto' :
                                  'Projekterfolgsgarantie'}
                            </h3>
                        </div>
                        <p class="text-sub text-base leading-relaxed">
                            ${lang === 'ko' ? '일정·기능 미달 시 일부 보상 제공, 프리미엄 프로젝트 적용으로 플랫폼 신뢰도 상승' : 
                              lang === 'en' ? 'Partial compensation for schedule/feature shortfall, applied to premium projects to increase platform trust' :
                              lang === 'zh' ? '时间表/功能不足时提供部分补偿，应用于高级项目以提高平台信任度' :
                              lang === 'ja' ? 'スケジュール・機能未達時一部補償提供、プレミアムプロジェクト適用でプラットフォーム信頼度上昇' :
                              lang === 'vi' ? 'Bồi thường một phần khi thiếu lịch trình/tính năng, áp dụng cho dự án cao cấp để tăng độ tin cậy nền tảng' :
                              lang === 'th' ? 'ชดเชยบางส่วนสำหรับการขาดแคลนกำหนดการ/คุณสมบัติ นำไปใช้กับโครงการพรีเมียมเพื่อเพิ่มความน่าเชื่อถือของแพลตฟอร์ม' :
                              lang === 'es' ? 'Compensación parcial por déficit de cronograma/características, aplicado a proyectos premium para aumentar la confianza en la plataforma' :
                              'Teilkompensation bei Zeitplan-/Funktionsdefiziten, angewendet auf Premium-Projekte zur Steigerung des Plattformvertrauens'}
                        </p>
                    </div>

                    <!-- Feature 10: Maintenance Transition -->
                    <div class="feature-card card-hover">
                        <div class="flex items-center mb-5">
                            <div class="text-2xl md:text-4xl mr-3 md:mr-4" style="color: #06B6D4;">
                                <i class="fas fa-tools"></i>
                            </div>
                            <h3 class="text-base md:text-xl font-semibold text-luxury">
                                ${lang === 'ko' ? '운영·유지보수 연계' : 
                                  lang === 'en' ? 'Maintenance Transition' :
                                  lang === 'zh' ? '运营维护衔接' :
                                  lang === 'ja' ? '運用・保守連携' :
                                  lang === 'vi' ? 'Chuyển đổi bảo trì' :
                                  lang === 'th' ? 'การเปลี่ยนไปสู่การบำรุงรักษา' :
                                  lang === 'es' ? 'Transición de mantenimiento' :
                                  'Wartungsübergang'}
                            </h3>
                        </div>
                        <p class="text-sub text-base leading-relaxed">
                            ${lang === 'ko' ? '개발 완료 후 운영 전환 모드, 월 단위 유지보수 계약 자동 전환으로 장기 관리' : 
                              lang === 'en' ? 'Operation transition mode after development, auto monthly maintenance contract conversion for long-term management' :
                              lang === 'zh' ? '开发完成后运营转换模式，自动月度维护合同转换用于长期管理' :
                              lang === 'ja' ? '開発完了後運用転換モード、月単位保守契約自動転換で長期管理' :
                              lang === 'vi' ? 'Chế độ chuyển đổi hoạt động sau phát triển, chuyển đổi hợp đồng bảo trì hàng tháng tự động để quản lý dài hạn' :
                              lang === 'th' ? 'โหมดการเปลี่ยนไปสู่การดำเนินงานหลังการพัฒนา การแปลงสัญญาบำรุงรักษารายเดือนอัตโนมัติสำหรับการจัดการระยะยาว' :
                              lang === 'es' ? 'Modo de transición operativa después del desarrollo, conversión automática de contrato de mantenimiento mensual para gestión a largo plazo' :
                              'Betriebsübergangsmodus nach Entwicklung, automatische monatliche Wartungsvertragsumwandlung für langfristige Verwaltung'}
                        </p>
                    </div>
                </div>
                
                <!-- Global Connection Emphasis -->
                <div class="mt-16 feature-card text-center" style="background: linear-gradient(135deg, var(--deep-navy) 0%, #1a2c3d 100%); color: white; padding: 48px;">
                    <h3 class="text-4xl font-semibold mb-6">
                        <i class="fas fa-globe-americas mr-3"></i>
                        ${lang === 'ko' ? '글로벌 의뢰인과 개발자 연결' : 
                          lang === 'en' ? 'Connecting Global Clients and Developers' :
                          lang === 'zh' ? '连接全球委托人和开发者' :
                          lang === 'ja' ? 'グローバルな依頼者と開発者をつなぐ' :
                          lang === 'vi' ? 'Kết nối khách hàng và nhà phát triển toàn cầu' :
                          lang === 'th' ? 'เชื่อมต่อลูกค้าและนักพัฒนาทั่วโลก' :
                          lang === 'es' ? 'Conectando clientes y desarrolladores globales' :
                          'Globale Kunden und Entwickler verbinden'}
                    </h3>
                    <p class="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
                        ${lang === 'ko' ? '8개 언어 지원으로 한국, 미국, 중국, 일본, 베트남, 태국, 스페인, 독일 등 전 세계 시장 연결' : 
                          lang === 'en' ? 'Supporting 8 languages to connect global markets: Korea, USA, China, Japan, Vietnam, Thailand, Spain, Germany' :
                          lang === 'zh' ? '支持8种语言连接全球市场：韩国、美国、中国、日本、越南、泰国、西班牙、德国' :
                          lang === 'ja' ? '8言語対応で韓国、米国、中国、日本、ベトナム、タイ、スペイン、ドイツなど世界市場を接続' :
                          lang === 'vi' ? 'Hỗ trợ 8 ngôn ngữ để kết nối thị trường toàn cầu: Hàn Quốc, Mỹ, Trung Quốc, Nhật Bản, Việt Nam, Thái Lan, Tây Ban Nha, Đức' :
                          lang === 'th' ? 'รองรับ 8 ภาษาเพื่อเชื่อมต่อตลาดโลก: เกาหลี สหรัฐอเมริกา จีน ญี่ปุ่น เวียดนาม ไทย สเปน เยอรมนี' :
                          lang === 'es' ? 'Soporte para 8 idiomas para conectar mercados globales: Corea, EE.UU., China, Japón, Vietnam, Tailandia, España, Alemania' :
                          '8-Sprachen-Unterstützung zur Verbindung globaler Märkte: Korea, USA, China, Japan, Vietnam, Thailand, Spanien, Deutschland'}
                    </p>
                    <div class="flex justify-center space-x-6 text-4xl">
                        <span class="hover:scale-110 transition-transform cursor-pointer">🇰🇷</span>
                        <span class="hover:scale-110 transition-transform cursor-pointer">🇺🇸</span>
                        <span class="hover:scale-110 transition-transform cursor-pointer">🇨🇳</span>
                        <span class="hover:scale-110 transition-transform cursor-pointer">🇯🇵</span>
                        <span class="hover:scale-110 transition-transform cursor-pointer">🇻🇳</span>
                        <span class="hover:scale-110 transition-transform cursor-pointer">🇹🇭</span>
                        <span class="hover:scale-110 transition-transform cursor-pointer">🇪🇸</span>
                        <span class="hover:scale-110 transition-transform cursor-pointer">🇩🇪</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Stats Section -->
        <div class="py-6 md:py-24" style="background: var(--deep-navy);">
            <div class="max-w-7xl mx-auto px-4 lg:px-8">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12 text-center text-white">
                    <div class="card-hover">
                        <div class="text-2xl md:text-6xl font-semibold mb-1 md:mb-3" style="color: #D4AF37;">10,000+</div>
                        <div class="text-xs md:text-lg opacity-80 font-light">${t('stats.freelancers', lang)}</div>
                    </div>
                    <div class="card-hover">
                        <div class="text-2xl md:text-6xl font-semibold mb-1 md:mb-3" style="color: #D4AF37;">5,000+</div>
                        <div class="text-xs md:text-lg opacity-80 font-light">${t('stats.completed_projects', lang)}</div>
                    </div>
                    <div class="card-hover">
                        <div class="text-2xl md:text-6xl font-semibold mb-1 md:mb-3" style="color: #D4AF37;">98%</div>
                        <div class="text-xs md:text-lg opacity-80 font-light">${t('stats.client_satisfaction', lang)}</div>
                    </div>
                    <div class="card-hover">
                        <div class="text-2xl md:text-6xl font-semibold mb-1 md:mb-3" style="color: #D4AF37;">24/7</div>
                        <div class="text-xs md:text-lg opacity-80 font-light">${lang === 'ko' ? '고객 지원' : lang === 'en' ? 'Customer Support' : lang === 'zh' ? '客户支持' : 'カスタマーサポート'}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="py-6 md:py-16" style="background: var(--charcoal-black); color: white;">
            <div class="max-w-7xl mx-auto px-4 lg:px-8">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12">
                    <div class="col-span-2 md:col-span-1">
                        <h4 class="text-sm md:text-2xl font-semibold mb-2 md:mb-4">${t('platform.name', lang)}</h4>
                        <p class="opacity-60 leading-relaxed text-sm md:text-base">${t('platform.tagline', lang)}</p>
                    </div>
                    <div>
                        <h4 class="font-semibold mb-3 md:mb-4 text-sm md:text-lg">${lang === 'ko' ? '서비스' : lang === 'en' ? 'Services' : lang === 'zh' ? '服务' : 'サービス'}</h4>
                        <ul class="space-y-3 opacity-70">
                            <li><a href="javascript:void(0)" onclick="navigateToProjects()" class="hover:opacity-100 transition cursor-pointer">${t('nav.find_projects', lang)}</a></li>
                            <li><a href="javascript:void(0)" onclick="navigateToFreelancers()" class="hover:opacity-100 transition cursor-pointer">${t('nav.find_experts', lang)}</a></li>
                            <li><a href="javascript:void(0)" onclick="navigateToCategories()" class="hover:opacity-100 transition cursor-pointer">${t('nav.categories', lang)}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-semibold mb-4 text-lg">${lang === 'ko' ? '지원' : lang === 'en' ? 'Support' : lang === 'zh' ? '支持' : 'サポート'}</h4>
                        <ul class="space-y-3 opacity-70">
                            <li><a href="/faq" class="hover:opacity-100 transition">FAQ</a></li>
                            <li><a href="/contact" class="hover:opacity-100 transition">${lang === 'ko' ? '문의하기' : lang === 'en' ? 'Contact' : lang === 'zh' ? '联系我们' : 'お問い合わせ'}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-semibold mb-4 text-lg">${lang === 'ko' ? '소셜 미디어' : lang === 'en' ? 'Social Media' : lang === 'zh' ? '社交媒体' : 'ソーシャルメディア'}</h4>
                        <div class="flex space-x-4 text-2xl">
                            <a href="#" class="hover:opacity-100 opacity-70 transition" style="color: #D4AF37;"><i class="fab fa-twitter"></i></a>
                            <a href="#" class="hover:opacity-100 opacity-70 transition" style="color: #D4AF37;"><i class="fab fa-facebook"></i></a>
                            <a href="#" class="hover:opacity-100 opacity-70 transition" style="color: #D4AF37;"><i class="fab fa-linkedin"></i></a>
                        </div>
                    </div>
                </div>
                <div class="mt-12 pt-8 text-center opacity-60" style="border-top: 1px solid rgba(255,255,255,0.1);">
                    <p class="text-sm">&copy; 2025 ${t('platform.name', lang)}. All rights reserved.</p>
                </div>
            </div>
        </footer>

        <!-- Modal Container -->
        <div id="modalContainer" class="hidden fixed inset-0 z-50 overflow-y-auto">
            <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onclick="closeModal()"></div>
                <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div id="modalContent"></div>
                </div>
            </div>
        </div>

        <script>
            const lang = new URL(window.location.href).searchParams.get('lang') || 'ko';
            
            const translations = {
                ko: {
                    notices: { title: '🎉 FeeZero 플랫폼 오픈!', items: ['세계 최저 수수료: 의뢰인 2%, 개발자 0%', '8개국 언어 지원', 'USDT 결제로 안전한 거래', 'AI 기반 프로젝트 매칭'] },
                    register: { title: '회원가입', userType: '회원 유형', client: '의뢰인', freelancer: '프리랜서', email: '이메일', password: '비밀번호', confirmPw: '비밀번호 확인', fullName: '이름', phone: '전화번호', country: '국가', submit: '가입하기', cancel: '취소' },
                    login: { title: '로그인', email: '이메일', password: '비밀번호', submit: '로그인', cancel: '취소', forgot: '비밀번호 찾기' }
                },
                en: {
                    notices: { title: '🎉 FeeZero Platform Launch!', items: ['Lowest fees: Client 2%, Developer 0%', '8 language support', 'Secure USDT transactions', 'AI-powered matching'] },
                    register: { title: 'Sign Up', userType: 'User Type', client: 'Client', freelancer: 'Freelancer', email: 'Email', password: 'Password', confirmPw: 'Confirm Password', fullName: 'Full Name', phone: 'Phone', country: 'Country', submit: 'Sign Up', cancel: 'Cancel' },
                    login: { title: 'Login', email: 'Email', password: 'Password', submit: 'Login', cancel: 'Cancel', forgot: 'Forgot Password' }
                },
                zh: {
                    notices: { title: '🎉 FeeZero 平台开放！', items: ['最低手续费：委托人2%，开发者0%', '支持8种语言', 'USDT安全交易', 'AI项目匹配'] },
                    register: { title: '注册', userType: '用户类型', client: '委托人', freelancer: '自由职业者', email: '电子邮件', password: '密码', confirmPw: '确认密码', fullName: '姓名', phone: '电话', country: '国家', submit: '注册', cancel: '取消' },
                    login: { title: '登录', email: '电子邮件', password: '密码', submit: '登录', cancel: '取消', forgot: '忘记密码' }
                },
                ja: {
                    notices: { title: '🎉 FeeZeroオープン！', items: ['最低手数料：依頼者2%、開発者0%', '8言語対応', 'USDT安全取引', 'AIマッチング'] },
                    register: { title: '会員登録', userType: 'ユーザータイプ', client: '依頼者', freelancer: 'フリーランサー', email: 'メール', password: 'パスワード', confirmPw: 'パスワード確認', fullName: '氏名', phone: '電話番号', country: '国', submit: '登録', cancel: 'キャンセル' },
                    login: { title: 'ログイン', email: 'メール', password: 'パスワード', submit: 'ログイン', cancel: 'キャンセル', forgot: 'パスワード再設定' }
                },
                vi: {
                    notices: { title: '🎉 FeeZero ra mắt!', items: ['Phí thấp nhất: Khách 2%, Dev 0%', 'Hỗ trợ 8 ngôn ngữ', 'Giao dịch USDT an toàn', 'Ghép đôi AI'] },
                    register: { title: 'Đăng ký', userType: 'Loại người dùng', client: 'Khách hàng', freelancer: 'Freelancer', email: 'Email', password: 'Mật khẩu', confirmPw: 'Xác nhận MK', fullName: 'Họ tên', phone: 'Điện thoại', country: 'Quốc gia', submit: 'Đăng ký', cancel: 'Hủy' },
                    login: { title: 'Đăng nhập', email: 'Email', password: 'Mật khẩu', submit: 'Đăng nhập', cancel: 'Hủy', forgot: 'Quên mật khẩu' }
                },
                th: {
                    notices: { title: '🎉 FeeZero เปิดตัว!', items: ['ค่าธรรมเนียมต่ำสุด: ลูกค้า 2%, Dev 0%', 'รองรับ 8 ภาษา', 'ธุรกรรม USDT ปลอดภัย', 'จับคู่ AI'] },
                    register: { title: 'สมัครสมาชิก', userType: 'ประเภทผู้ใช้', client: 'ลูกค้า', freelancer: 'ฟรีแลนซ์', email: 'อีเมล', password: 'รหัสผ่าน', confirmPw: 'ยืนยันรหัสผ่าน', fullName: 'ชื่อ', phone: 'โทรศัพท์', country: 'ประเทศ', submit: 'สมัคร', cancel: 'ยกเลิก' },
                    login: { title: 'เข้าสู่ระบบ', email: 'อีเมล', password: 'รหัสผ่าน', submit: 'เข้าสู่ระบบ', cancel: 'ยกเลิก', forgot: 'ลืมรหัสผ่าน' }
                },
                es: {
                    notices: { title: '🎉 ¡FeeZero lanzado!', items: ['Tarifas más bajas: Cliente 2%, Dev 0%', 'Soporte 8 idiomas', 'Transacciones USDT seguras', 'Emparejamiento IA'] },
                    register: { title: 'Registro', userType: 'Tipo de usuario', client: 'Cliente', freelancer: 'Freelancer', email: 'Correo', password: 'Contraseña', confirmPw: 'Confirmar contraseña', fullName: 'Nombre', phone: 'Teléfono', country: 'País', submit: 'Registrarse', cancel: 'Cancelar' },
                    login: { title: 'Iniciar sesión', email: 'Correo', password: 'Contraseña', submit: 'Iniciar', cancel: 'Cancelar', forgot: 'Olvidé contraseña' }
                },
                de: {
                    notices: { title: '🎉 FeeZero Start!', items: ['Niedrigste Gebühren: Kunde 2%, Dev 0%', '8 Sprachen', 'Sichere USDT-Transaktionen', 'KI-Matching'] },
                    register: { title: 'Registrierung', userType: 'Benutzertyp', client: 'Kunde', freelancer: 'Freiberufler', email: 'E-Mail', password: 'Passwort', confirmPw: 'Passwort bestätigen', fullName: 'Name', phone: 'Telefon', country: 'Land', submit: 'Registrieren', cancel: 'Abbrechen' },
                    login: { title: 'Anmelden', email: 'E-Mail', password: 'Passwort', submit: 'Anmelden', cancel: 'Abbrechen', forgot: 'Passwort vergessen' }
                }
            };
            
            const t = translations[lang] || translations.ko;
            
            function changeLang(newLang) {
                const url = new URL(window.location.href);
                url.searchParams.set('lang', newLang);
                window.location.href = url.toString();
            }
            
            function openModal(content) {
                document.getElementById('modalContent').innerHTML = content;
                document.getElementById('modalContainer').classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }
            
            function closeModal() {
                document.getElementById('modalContainer').classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
            
            function showNotices() {
                const content = \`
                    <div class="p-8">
                        <h3 class="text-3xl font-semibold mb-6 text-luxury">\${t.notices.title}</h3>
                        <ul class="space-y-3 mb-6">
                            \${t.notices.items.map(item => \`<li class="flex items-start"><span class="text-xl mr-2" style="color: var(--deep-navy);">✓</span><span class="text-sub">\${item}</span></li>\`).join('')}
                        </ul>
                        <button onclick="closeModal()" class="btn-primary w-full py-3 rounded-full font-medium">
                            \${t.register.cancel}
                        </button>
                    </div>
                \`;
                openModal(content);
            }
            
            function showRegister() {
                const content = \`
                    <div class="p-8">
                        <h3 class="text-3xl font-semibold mb-6 text-luxury">\${t.register.title}</h3>
                        <form onsubmit="handleRegister(event)" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-sub mb-2">\${t.register.userType}</label>
                                <select name="userType" required class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-transparent" style="min-height: 44px;">
                                    <option value="client">\${t.register.client}</option>
                                    <option value="freelancer">\${t.register.freelancer}</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-sub mb-2">\${t.register.email}</label>
                                <input type="email" name="email" required class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-transparent" style="min-height: 44px;">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-sub mb-2">\${t.register.password}</label>
                                <input type="password" name="password" required class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-transparent" style="min-height: 44px;">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-sub mb-2">\${t.register.confirmPw}</label>
                                <input type="password" name="confirmPassword" required class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-transparent" style="min-height: 44px;">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-sub mb-2">\${t.register.fullName}</label>
                                <input type="text" name="fullName" required class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-transparent" style="min-height: 44px;">
                            </div>
                            <div class="flex gap-4 mt-6">
                                <button type="button" onclick="closeModal()" class="btn-secondary flex-1 py-3 rounded-full font-medium" style="min-height: 44px;">
                                    \${t.register.cancel}
                                </button>
                                <button type="submit" class="btn-primary flex-1 py-3 rounded-full font-medium" style="min-height: 44px;">
                                    \${t.register.submit}
                                </button>
                            </div>
                        </form>
                    </div>
                \`;
                openModal(content);
            }
            
            function showLogin() {
                const content = \`
                    <div class="p-8">
                        <h3 class="text-3xl font-semibold mb-6 text-luxury">\${t.login.title}</h3>
                        <form onsubmit="handleLogin(event)" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-sub mb-2">\${t.login.email}</label>
                                <input type="email" name="email" required class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-transparent" style="min-height: 44px;">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-sub mb-2">\${t.login.password}</label>
                                <input type="password" name="password" required class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-transparent" style="min-height: 44px;">
                            </div>
                            <div class="text-right">
                                <a href="#" class="text-sm text-sub hover:text-luxury">\${t.login.forgot}</a>
                            </div>
                            <div class="flex gap-4 mt-6">
                                <button type="button" onclick="closeModal()" class="btn-secondary flex-1 py-3 rounded-full font-medium" style="min-height: 44px;">
                                    \${t.login.cancel}
                                </button>
                                <button type="submit" class="btn-primary flex-1 py-3 rounded-full font-medium" style="min-height: 44px;">
                                    \${t.login.submit}
                                </button>
                            </div>
                        </form>
                    </div>
                \`;
                openModal(content);
            }
            
            function handleRegister(e) {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData);
                console.log('Register data:', data);
                alert(\`\${t.register.title} \${lang === 'ko' ? '성공!' : 'Success!'}\n\${lang === 'ko' ? '환영합니다' : 'Welcome'}: \${data.email}\`);
                closeModal();
            }
            
            function handleLogin(e) {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData);
                console.log('Login data:', data);
                alert(\`\${t.login.title} \${lang === 'ko' ? '성공!' : 'Success!'}\n\${lang === 'ko' ? '환영합니다' : 'Welcome'}: \${data.email}\`);
                closeModal();
            }
            
            // Mobile menu toggle
            function toggleMobileMenu() {
                const menu = document.getElementById('mobileMenu');
                menu.classList.toggle('hidden');
            }
            
            // Show project submission form
            function showProjectForm() {
                const content = \`
                    <div class="p-6 md:p-8">
                        <h3 class="text-2xl md:text-3xl font-semibold mb-6 text-luxury">\${lang === 'ko' ? '프로젝트 의뢰하기' : 'Post a Project'}</h3>
                        <form onsubmit="handleProjectSubmit(event)" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-sub mb-2">\${lang === 'ko' ? '프로젝트 제목' : 'Project Title'}</label>
                                <input type="text" name="title" required class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-sub mb-2">\${lang === 'ko' ? '프로젝트 설명' : 'Description'}</label>
                                <textarea name="description" required rows="4" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-sub mb-2">\${lang === 'ko' ? '최소 예산 (USDT)' : 'Min Budget (USDT)'}</label>
                                    <input type="number" name="budget_min" required class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-sub mb-2">\${lang === 'ko' ? '최대 예산 (USDT)' : 'Max Budget (USDT)'}</label>
                                    <input type="number" name="budget_max" required class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-sub mb-2">\${lang === 'ko' ? '기술 스택' : 'Tech Stack'}</label>
                                <input type="text" name="tech_stack" placeholder="\${lang === 'ko' ? '예: React, Node.js, Python' : 'e.g. React, Node.js, Python'}" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-sub mb-2">\${lang === 'ko' ? '긴급 여부' : 'Urgent'}</label>
                                <input type="checkbox" name="is_urgent" class="mr-2">
                                <span class="text-sm text-gray-600">\${lang === 'ko' ? '긴급 프로젝트로 표시' : 'Mark as urgent'}</span>
                            </div>
                            <div class="flex gap-4 mt-6">
                                <button type="button" onclick="closeModal()" class="btn-secondary flex-1 py-3 rounded-full font-medium">
                                    \${lang === 'ko' ? '취소' : 'Cancel'}
                                </button>
                                <button type="submit" class="btn-primary flex-1 py-3 rounded-full font-medium">
                                    \${lang === 'ko' ? '프로젝트 등록' : 'Submit Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                \`;
                openModal(content);
            }
            
            // Show freelancer application form
            function showFreelancerForm() {
                const content = \`
                    <div class="p-6 md:p-8">
                        <h3 class="text-2xl md:text-3xl font-semibold mb-6 text-luxury">\${lang === 'ko' ? '전문가 등록하기' : 'Register as Expert'}</h3>
                        <form onsubmit="handleFreelancerSubmit(event)" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-sub mb-2">\${lang === 'ko' ? '전문 분야' : 'Title'}</label>
                                <input type="text" name="title" required placeholder="\${lang === 'ko' ? '예: 풀스택 개발자' : 'e.g. Full-stack Developer'}" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-sub mb-2">\${lang === 'ko' ? '자기소개' : 'Bio'}</label>
                                <textarea name="bio" required rows="4" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-sub mb-2">\${lang === 'ko' ? '시간당 요금 (USDT)' : 'Hourly Rate (USDT)'}</label>
                                    <input type="number" name="hourly_rate" required class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-sub mb-2">\${lang === 'ko' ? '가능 시간' : 'Availability'}</label>
                                    <select name="availability" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="full-time">\${lang === 'ko' ? '풀타임' : 'Full-time'}</option>
                                        <option value="part-time">\${lang === 'ko' ? '파트타임' : 'Part-time'}</option>
                                        <option value="contract">\${lang === 'ko' ? '계약직' : 'Contract'}</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-sub mb-2">\${lang === 'ko' ? '기술 스택' : 'Skills'}</label>
                                <input type="text" name="skills" required placeholder="\${lang === 'ko' ? '예: React, Node.js, Python' : 'e.g. React, Node.js, Python'}" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            <div class="flex gap-4 mt-6">
                                <button type="button" onclick="closeModal()" class="btn-secondary flex-1 py-3 rounded-full font-medium">
                                    \${lang === 'ko' ? '취소' : 'Cancel'}
                                </button>
                                <button type="submit" class="btn-primary flex-1 py-3 rounded-full font-medium">
                                    \${lang === 'ko' ? '전문가 등록' : 'Register'}
                                </button>
                            </div>
                        </form>
                    </div>
                \`;
                openModal(content);
            }
            
            // Handle project submission
            function handleProjectSubmit(e) {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData);
                console.log('Project data:', data);
                alert(\`\${lang === 'ko' ? '프로젝트가 등록되었습니다!' : 'Project submitted!'}\n\${lang === 'ko' ? '제목' : 'Title'}: \${data.title}\`);
                closeModal();
            }
            
            // Handle freelancer submission
            function handleFreelancerSubmit(e) {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData);
                console.log('Freelancer data:', data);
                alert(\`\${lang === 'ko' ? '전문가 등록이 완료되었습니다!' : 'Registration completed!'}\n\${lang === 'ko' ? '전문 분야' : 'Title'}: \${data.title}\`);
                closeModal();
            }
            
            // Close modal on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeModal();
            });
        </script>
    </body>
    </html>
  `)
})

export default app
