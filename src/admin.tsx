import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Bindings } from './types'
import { queryDatabase, createApiResponse } from './db'

const admin = new Hono<{ Bindings: Bindings }>()

// Enable CORS
admin.use('*', cors())

// ===========================
// Admin Dashboard UI
// ===========================
admin.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FeeZero 관리자 페이지</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          .tab-content { display: none; }
          .tab-content.active { display: block; }
          .tab-btn.active { 
            background-color: #7c3aed; 
            color: white; 
          }
        </style>
    </head>
    <body class="bg-gray-100">
        <!-- Header -->
        <nav class="bg-purple-600 text-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <h1 class="text-2xl font-bold">
                        <i class="fas fa-shield-alt mr-2"></i>
                        FeeZero 관리자 페이지
                    </h1>
                    <div class="text-sm">
                        <i class="fas fa-user-shield mr-1"></i>
                        관리자 모드
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="max-w-7xl mx-auto px-4 py-8">
            <!-- Tabs -->
            <div class="bg-white rounded-lg shadow-md mb-6">
                <div class="flex border-b">
                    <button onclick="switchTab('users')" class="tab-btn active px-6 py-3 font-semibold" id="tab-users">
                        <i class="fas fa-users mr-2"></i>회원 관리
                    </button>
                    <button onclick="switchTab('announcements')" class="tab-btn px-6 py-3 font-semibold" id="tab-announcements">
                        <i class="fas fa-bullhorn mr-2"></i>공지사항 관리
                    </button>
                    <button onclick="switchTab('posts')" class="tab-btn px-6 py-3 font-semibold" id="tab-posts">
                        <i class="fas fa-newspaper mr-2"></i>게시물 관리
                    </button>
                    <button onclick="switchTab('stats')" class="tab-btn px-6 py-3 font-semibold" id="tab-stats">
                        <i class="fas fa-chart-bar mr-2"></i>통계
                    </button>
                </div>
            </div>

            <!-- Users Tab -->
            <div id="content-users" class="tab-content active">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">회원 관리</h2>
                        <button onclick="showUserModal()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                            <i class="fas fa-plus mr-2"></i>회원 추가
                        </button>
                    </div>
                    
                    <!-- User List -->
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">닉네임</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">회원 등급</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                                </tr>
                            </thead>
                            <tbody id="userList" class="bg-white divide-y divide-gray-200">
                                <!-- Users will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Announcements Tab -->
            <div id="content-announcements" class="tab-content">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">공지사항 관리</h2>
                        <button onclick="showAnnouncementModal()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                            <i class="fas fa-plus mr-2"></i>공지 추가
                        </button>
                    </div>
                    
                    <div id="announcementList" class="space-y-4">
                        <!-- Announcements will be loaded here -->
                    </div>
                </div>
            </div>

            <!-- Posts Tab -->
            <div id="content-posts" class="tab-content">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">게시물 관리</h2>
                        <button onclick="showPostModal()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                            <i class="fas fa-plus mr-2"></i>게시물 추가
                        </button>
                    </div>
                    
                    <div id="postList" class="space-y-4">
                        <!-- Posts will be loaded here -->
                    </div>
                </div>
            </div>

            <!-- Stats Tab -->
            <div id="content-stats" class="tab-content">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">통계</h2>
                    
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div class="bg-blue-100 p-6 rounded-lg">
                            <div class="text-blue-600 text-3xl mb-2"><i class="fas fa-users"></i></div>
                            <div class="text-2xl font-bold" id="stat-total-users">0</div>
                            <div class="text-gray-600">전체 회원</div>
                        </div>
                        <div class="bg-green-100 p-6 rounded-lg">
                            <div class="text-green-600 text-3xl mb-2"><i class="fas fa-crown"></i></div>
                            <div class="text-2xl font-bold" id="stat-premium-users">0</div>
                            <div class="text-gray-600">유료 회원</div>
                        </div>
                        <div class="bg-purple-100 p-6 rounded-lg">
                            <div class="text-purple-600 text-3xl mb-2"><i class="fas fa-briefcase"></i></div>
                            <div class="text-2xl font-bold" id="stat-total-projects">0</div>
                            <div class="text-gray-600">전체 프로젝트</div>
                        </div>
                        <div class="bg-yellow-100 p-6 rounded-lg">
                            <div class="text-yellow-600 text-3xl mb-2"><i class="fas fa-bullhorn"></i></div>
                            <div class="text-2xl font-bold" id="stat-total-announcements">0</div>
                            <div class="text-gray-600">공지사항</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- User Modal -->
        <div id="userModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
            <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                <h3 class="text-2xl font-bold mb-4">회원 정보</h3>
                <form id="userForm">
                    <input type="hidden" id="userId">
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">이메일 *</label>
                        <input type="email" id="userEmail" class="w-full border rounded-lg px-4 py-2" required>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">닉네임 *</label>
                        <input type="text" id="userNickname" class="w-full border rounded-lg px-4 py-2" required>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">전화번호</label>
                        <input type="tel" id="userPhone" class="w-full border rounded-lg px-4 py-2">
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">회원 등급 *</label>
                        <select id="userMembership" class="w-full border rounded-lg px-4 py-2" required>
                            <option value="free">무료 회원</option>
                            <option value="premium">유료 회원</option>
                            <option value="admin">관리자</option>
                        </select>
                    </div>
                    <div class="flex justify-end space-x-4">
                        <button type="button" onclick="closeUserModal()" class="px-4 py-2 border rounded-lg hover:bg-gray-100">취소</button>
                        <button type="submit" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">저장</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Announcement Modal -->
        <div id="announcementModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
            <div class="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
                <h3 class="text-2xl font-bold mb-4">공지사항</h3>
                <form id="announcementForm">
                    <input type="hidden" id="announcementId">
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">제목 *</label>
                        <input type="text" id="announcementTitle" class="w-full border rounded-lg px-4 py-2" required>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">내용 *</label>
                        <textarea id="announcementContent" class="w-full border rounded-lg px-4 py-2 h-40" required></textarea>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">우선순위</label>
                        <select id="announcementPriority" class="w-full border rounded-lg px-4 py-2">
                            <option value="normal">일반</option>
                            <option value="important">중요</option>
                            <option value="urgent">긴급</option>
                        </select>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">이미지 업로드</label>
                        <input type="file" id="announcementImage" class="w-full border rounded-lg px-4 py-2" accept="image/*">
                        <p class="text-sm text-gray-500 mt-1">이미지는 PC에서 업로드됩니다</p>
                    </div>
                    <div class="flex justify-end space-x-4">
                        <button type="button" onclick="closeAnnouncementModal()" class="px-4 py-2 border rounded-lg hover:bg-gray-100">취소</button>
                        <button type="submit" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">저장</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Post Modal -->
        <div id="postModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
            <div class="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
                <h3 class="text-2xl font-bold mb-4">게시물</h3>
                <form id="postForm">
                    <input type="hidden" id="postId">
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">제목 *</label>
                        <input type="text" id="postTitle" class="w-full border rounded-lg px-4 py-2" required>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">내용 *</label>
                        <textarea id="postContent" class="w-full border rounded-lg px-4 py-2 h-40" required></textarea>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">게시물 유형</label>
                        <select id="postType" class="w-full border rounded-lg px-4 py-2">
                            <option value="article">기사</option>
                            <option value="news">뉴스</option>
                            <option value="blog">블로그</option>
                            <option value="guide">가이드</option>
                            <option value="faq">FAQ</option>
                        </select>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">상태</label>
                        <select id="postStatus" class="w-full border rounded-lg px-4 py-2">
                            <option value="draft">초안</option>
                            <option value="published">게시됨</option>
                            <option value="archived">보관됨</option>
                        </select>
                    </div>
                    <div class="flex justify-end space-x-4">
                        <button type="button" onclick="closePostModal()" class="px-4 py-2 border rounded-lg hover:bg-gray-100">취소</button>
                        <button type="submit" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">저장</button>
                    </div>
                </form>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            // Tab switching
            function switchTab(tabName) {
                // Hide all tabs
                document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
                document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
                
                // Show selected tab
                document.getElementById('content-' + tabName).classList.add('active');
                document.getElementById('tab-' + tabName).classList.add('active');
                
                // Load data for the tab
                if (tabName === 'users') loadUsers();
                if (tabName === 'announcements') loadAnnouncements();
                if (tabName === 'posts') loadPosts();
                if (tabName === 'stats') loadStats();
            }

            // Load data on page load
            window.onload = function() {
                loadUsers();
                loadStats();
            };

            // User Management
            async function loadUsers() {
                try {
                    const response = await axios.get('/admin/api/users');
                    const users = response.data.data || [];
                    
                    const tbody = document.getElementById('userList');
                    tbody.innerHTML = users.map(user => \`
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">\${user.id}</td>
                            <td class="px-6 py-4 whitespace-nowrap">\${user.email}</td>
                            <td class="px-6 py-4 whitespace-nowrap">\${user.nickname}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 py-1 text-xs rounded-full \${user.membership_type === 'premium' ? 'bg-green-100 text-green-800' : user.membership_type === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}">
                                    \${user.membership_type === 'premium' ? '유료' : user.membership_type === 'admin' ? '관리자' : '무료'}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">\${new Date(user.created_at).toLocaleDateString()}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                <button onclick="editUser(\${user.id})" class="text-blue-600 hover:text-blue-800 mr-3">
                                    <i class="fas fa-edit"></i> 편집
                                </button>
                                <button onclick="deleteUser(\${user.id})" class="text-red-600 hover:text-red-800">
                                    <i class="fas fa-trash"></i> 삭제
                                </button>
                            </td>
                        </tr>
                    \`).join('');
                } catch (error) {
                    console.error('Error loading users:', error);
                }
            }

            function showUserModal(userId = null) {
                document.getElementById('userModal').classList.remove('hidden');
                document.getElementById('userModal').classList.add('flex');
                
                if (userId) {
                    // Load user data for editing
                    // TODO: Implement edit functionality
                } else {
                    document.getElementById('userForm').reset();
                }
            }

            function closeUserModal() {
                document.getElementById('userModal').classList.add('hidden');
                document.getElementById('userModal').classList.remove('flex');
            }

            document.getElementById('userForm').onsubmit = async function(e) {
                e.preventDefault();
                const userId = document.getElementById('userId').value;
                const data = {
                    email: document.getElementById('userEmail').value,
                    nickname: document.getElementById('userNickname').value,
                    phone: document.getElementById('userPhone').value,
                    membership_type: document.getElementById('userMembership').value
                };
                
                try {
                    if (userId) {
                        await axios.put(\`/admin/api/users/\${userId}\`, data);
                    } else {
                        await axios.post('/admin/api/users', data);
                    }
                    closeUserModal();
                    loadUsers();
                    alert('저장되었습니다');
                } catch (error) {
                    alert('오류가 발생했습니다: ' + error.message);
                }
            };

            async function deleteUser(userId) {
                if (!confirm('정말 삭제하시겠습니까?')) return;
                
                try {
                    await axios.delete(\`/admin/api/users/\${userId}\`);
                    loadUsers();
                    alert('삭제되었습니다');
                } catch (error) {
                    alert('오류가 발생했습니다: ' + error.message);
                }
            }

            // Announcement Management
            async function loadAnnouncements() {
                try {
                    const response = await axios.get('/admin/api/announcements');
                    const announcements = response.data.data || [];
                    
                    const list = document.getElementById('announcementList');
                    list.innerHTML = announcements.map(ann => \`
                        <div class="border rounded-lg p-4">
                            <div class="flex justify-between items-start">
                                <div class="flex-1">
                                    <h3 class="font-bold text-lg">\${ann.title}</h3>
                                    <p class="text-gray-600 mt-2">\${ann.content.substring(0, 100)}...</p>
                                    \${ann.image_url ? \`<img src="\${ann.image_url}" class="mt-2 max-w-xs rounded" />\` : ''}
                                    <div class="text-sm text-gray-500 mt-2">\${new Date(ann.created_at).toLocaleDateString()}</div>
                                </div>
                                <div class="flex space-x-2">
                                    <button onclick="editAnnouncement(\${ann.id})" class="text-blue-600 hover:text-blue-800">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteAnnouncement(\${ann.id})" class="text-red-600 hover:text-red-800">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    \`).join('');
                } catch (error) {
                    console.error('Error loading announcements:', error);
                }
            }

            function showAnnouncementModal(announcementId = null) {
                document.getElementById('announcementModal').classList.remove('hidden');
                document.getElementById('announcementModal').classList.add('flex');
            }

            function closeAnnouncementModal() {
                document.getElementById('announcementModal').classList.add('hidden');
                document.getElementById('announcementModal').classList.remove('flex');
            }

            document.getElementById('announcementForm').onsubmit = async function(e) {
                e.preventDefault();
                const announcementId = document.getElementById('announcementId').value;
                const data = {
                    title: document.getElementById('announcementTitle').value,
                    content: document.getElementById('announcementContent').value,
                    priority: document.getElementById('announcementPriority').value
                };
                
                const imageFile = document.getElementById('announcementImage').files[0];
                if (imageFile) {
                    // TODO: Handle image upload
                    console.log('Image file selected:', imageFile.name);
                }
                
                try {
                    if (announcementId) {
                        await axios.put(\`/admin/api/announcements/\${announcementId}\`, data);
                    } else {
                        await axios.post('/admin/api/announcements', data);
                    }
                    closeAnnouncementModal();
                    loadAnnouncements();
                    alert('저장되었습니다');
                } catch (error) {
                    alert('오류가 발생했습니다: ' + error.message);
                }
            };

            async function deleteAnnouncement(announcementId) {
                if (!confirm('정말 삭제하시겠습니까?')) return;
                
                try {
                    await axios.delete(\`/admin/api/announcements/\${announcementId}\`);
                    loadAnnouncements();
                    alert('삭제되었습니다');
                } catch (error) {
                    alert('오류가 발생했습니다: ' + error.message);
                }
            }

            // Post Management
            async function loadPosts() {
                try {
                    const response = await axios.get('/admin/api/posts');
                    const posts = response.data.data || [];
                    
                    const list = document.getElementById('postList');
                    list.innerHTML = posts.map(post => \`
                        <div class="border rounded-lg p-4">
                            <div class="flex justify-between items-start">
                                <div class="flex-1">
                                    <h3 class="font-bold text-lg">\${post.title}</h3>
                                    <p class="text-gray-600 mt-2">\${post.content.substring(0, 100)}...</p>
                                    <div class="flex items-center space-x-4 mt-2">
                                        <span class="text-sm text-gray-500">\${post.post_type}</span>
                                        <span class="px-2 py-1 text-xs rounded-full \${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                            \${post.status}
                                        </span>
                                    </div>
                                </div>
                                <div class="flex space-x-2">
                                    <button onclick="editPost(\${post.id})" class="text-blue-600 hover:text-blue-800">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deletePost(\${post.id})" class="text-red-600 hover:text-red-800">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    \`).join('');
                } catch (error) {
                    console.error('Error loading posts:', error);
                }
            }

            function showPostModal(postId = null) {
                document.getElementById('postModal').classList.remove('hidden');
                document.getElementById('postModal').classList.add('flex');
            }

            function closePostModal() {
                document.getElementById('postModal').classList.add('hidden');
                document.getElementById('postModal').classList.remove('flex');
            }

            document.getElementById('postForm').onsubmit = async function(e) {
                e.preventDefault();
                const postId = document.getElementById('postId').value;
                const data = {
                    title: document.getElementById('postTitle').value,
                    content: document.getElementById('postContent').value,
                    post_type: document.getElementById('postType').value,
                    status: document.getElementById('postStatus').value
                };
                
                try {
                    if (postId) {
                        await axios.put(\`/admin/api/posts/\${postId}\`, data);
                    } else {
                        await axios.post('/admin/api/posts', data);
                    }
                    closePostModal();
                    loadPosts();
                    alert('저장되었습니다');
                } catch (error) {
                    alert('오류가 발생했습니다: ' + error.message);
                }
            };

            async function deletePost(postId) {
                if (!confirm('정말 삭제하시겠습니까?')) return;
                
                try {
                    await axios.delete(\`/admin/api/posts/\${postId}\`);
                    loadPosts();
                    alert('삭제되었습니다');
                } catch (error) {
                    alert('오류가 발생했습니다: ' + error.message);
                }
            }

            // Statistics
            async function loadStats() {
                try {
                    const response = await axios.get('/admin/api/stats');
                    const stats = response.data.data || {};
                    
                    document.getElementById('stat-total-users').textContent = stats.total_users || 0;
                    document.getElementById('stat-premium-users').textContent = stats.premium_users || 0;
                    document.getElementById('stat-total-projects').textContent = stats.total_projects || 0;
                    document.getElementById('stat-total-announcements').textContent = stats.total_announcements || 0;
                } catch (error) {
                    console.error('Error loading stats:', error);
                }
            }
        </script>
    </body>
    </html>
  `)
})

// ===========================
// Admin API Routes
// ===========================

// Get all users
admin.get('/api/users', async (c) => {
  try {
    const { DB } = c.env
    const users = await queryDatabase(
      DB,
      `SELECT id, email, nickname, phone, membership_type, created_at 
       FROM users 
       ORDER BY created_at DESC`
    )
    return c.json(createApiResponse(true, users))
  } catch (error: any) {
    return c.json(createApiResponse(false, null, error.message), 500)
  }
})

// Create user
admin.post('/api/users', async (c) => {
  try {
    const { DB } = c.env
    const { email, nickname, phone, membership_type } = await c.req.json()
    
    const result = await DB.prepare(`
      INSERT INTO users (email, nickname, phone, membership_type, user_type, country, is_active)
      VALUES (?, ?, ?, ?, 'client', 'KR', 1)
    `).bind(email, nickname, phone || null, membership_type || 'free').run()
    
    return c.json(createApiResponse(true, { id: result.meta.last_row_id }))
  } catch (error: any) {
    return c.json(createApiResponse(false, null, error.message), 500)
  }
})

// Update user
admin.put('/api/users/:id', async (c) => {
  try {
    const { DB } = c.env
    const id = parseInt(c.req.param('id'), 10)
    const { email, nickname, phone, membership_type } = await c.req.json()
    
    await DB.prepare(`
      UPDATE users 
      SET email = ?, nickname = ?, phone = ?, membership_type = ?
      WHERE id = ?
    `).bind(email, nickname, phone || null, membership_type, id).run()
    
    return c.json(createApiResponse(true, { id }))
  } catch (error: any) {
    return c.json(createApiResponse(false, null, error.message), 500)
  }
})

// Delete user
admin.delete('/api/users/:id', async (c) => {
  try {
    const { DB } = c.env
    const id = parseInt(c.req.param('id'), 10)
    
    await DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run()
    
    return c.json(createApiResponse(true, { id }))
  } catch (error: any) {
    return c.json(createApiResponse(false, null, error.message), 500)
  }
})

// Get all announcements
admin.get('/api/announcements', async (c) => {
  try {
    const { DB } = c.env
    const announcements = await queryDatabase(
      DB,
      `SELECT id, title, content, priority, image_url, created_at 
       FROM announcements 
       ORDER BY created_at DESC`
    )
    return c.json(createApiResponse(true, announcements))
  } catch (error: any) {
    return c.json(createApiResponse(false, null, error.message), 500)
  }
})

// Create announcement
admin.post('/api/announcements', async (c) => {
  try {
    const { DB } = c.env
    const { title, content, priority } = await c.req.json()
    
    const result = await DB.prepare(`
      INSERT INTO announcements (title, content, priority, is_active)
      VALUES (?, ?, ?, 1)
    `).bind(title, content, priority || 'normal').run()
    
    return c.json(createApiResponse(true, { id: result.meta.last_row_id }))
  } catch (error: any) {
    return c.json(createApiResponse(false, null, error.message), 500)
  }
})

// Delete announcement
admin.delete('/api/announcements/:id', async (c) => {
  try {
    const { DB } = c.env
    const id = parseInt(c.req.param('id'), 10)
    
    await DB.prepare('DELETE FROM announcements WHERE id = ?').bind(id).run()
    
    return c.json(createApiResponse(true, { id }))
  } catch (error: any) {
    return c.json(createApiResponse(false, null, error.message), 500)
  }
})

// Get all posts
admin.get('/api/posts', async (c) => {
  try {
    const { DB } = c.env
    const posts = await queryDatabase(
      DB,
      `SELECT id, title, content, post_type, status, created_at 
       FROM site_posts 
       ORDER BY created_at DESC`
    )
    return c.json(createApiResponse(true, posts))
  } catch (error: any) {
    return c.json(createApiResponse(false, null, error.message), 500)
  }
})

// Create post
admin.post('/api/posts', async (c) => {
  try {
    const { DB } = c.env
    const { title, content, post_type, status } = await c.req.json()
    
    const result = await DB.prepare(`
      INSERT INTO site_posts (author_id, title, content, post_type, status)
      VALUES (1, ?, ?, ?, ?)
    `).bind(title, content, post_type || 'article', status || 'draft').run()
    
    return c.json(createApiResponse(true, { id: result.meta.last_row_id }))
  } catch (error: any) {
    return c.json(createApiResponse(false, null, error.message), 500)
  }
})

// Delete post
admin.delete('/api/posts/:id', async (c) => {
  try {
    const { DB } = c.env
    const id = parseInt(c.req.param('id'), 10)
    
    await DB.prepare('DELETE FROM site_posts WHERE id = ?').bind(id).run()
    
    return c.json(createApiResponse(true, { id }))
  } catch (error: any) {
    return c.json(createApiResponse(false, null, error.message), 500)
  }
})

// Get statistics
admin.get('/api/stats', async (c) => {
  try {
    const { DB } = c.env
    
    const totalUsers = await queryDatabase<{ count: number }>(DB, 'SELECT COUNT(*) as count FROM users')
    const premiumUsers = await queryDatabase<{ count: number }>(DB, "SELECT COUNT(*) as count FROM users WHERE membership_type = 'premium'")
    const totalProjects = await queryDatabase<{ count: number }>(DB, 'SELECT COUNT(*) as count FROM projects')
    const totalAnnouncements = await queryDatabase<{ count: number }>(DB, 'SELECT COUNT(*) as count FROM announcements')
    
    return c.json(createApiResponse(true, {
      total_users: totalUsers[0]?.count || 0,
      premium_users: premiumUsers[0]?.count || 0,
      total_projects: totalProjects[0]?.count || 0,
      total_announcements: totalAnnouncements[0]?.count || 0
    }))
  } catch (error: any) {
    return c.json(createApiResponse(false, null, error.message), 500)
  }
})

export default admin
