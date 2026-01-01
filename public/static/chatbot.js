// 챗봇 - 완전 안전 버전 (null 체크 + DOMContentLoaded)

(function() {
  'use strict';
  
  console.log('[Chatbot] Script loaded at:', new Date().toISOString());

  // 중복 초기화 방지
  if (window.chatbotInitialized) {
    console.log('[Chatbot] Already initialized, skipping');
    return;
  }
  window.chatbotInitialized = true;

  // 전역 함수 먼저 정의
  window.openChatbot = function() {
    console.log('[Chatbot] Opening chatbot');
    const container = document.getElementById('chatbot-container');
    const icon = document.getElementById('chatbot-icon');
    
    if (!container || !icon) {
      console.error('[Chatbot] Elements not found:', { container: !!container, icon: !!icon });
      return;
    }
    
    container.style.display = 'flex';
    setTimeout(() => {
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
    }, 10);
    icon.style.display = 'none';
  };

  window.closeChatbot = function() {
    console.log('[Chatbot] Closing chatbot');
    const container = document.getElementById('chatbot-container');
    const icon = document.getElementById('chatbot-icon');
    
    if (!container || !icon) {
      console.error('[Chatbot] Elements not found');
      return;
    }
    
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';
    setTimeout(() => {
      container.style.display = 'none';
    }, 200);
    icon.style.display = 'flex';
  };

  // DOM 로드 후 초기화 (필수!)
  document.addEventListener('DOMContentLoaded', function() {
    console.log('[Chatbot] DOM Content Loaded, initializing...');
    
    // 요소 찾기
    const icon = document.getElementById('chatbot-icon');
    const closeBtn = document.getElementById('chatbot-close');
    const faqContainer = document.getElementById('faqContainer');
    const searchInput = document.getElementById('searchInput');
    
    // null 체크 (필수!)
    if (!icon) {
      console.error('[Chatbot] CRITICAL: Icon element not found!');
      return;
    }
    
    if (!closeBtn) {
      console.error('[Chatbot] CRITICAL: Close button not found!');
      return;
    }
    
    console.log('[Chatbot] All elements found, attaching listeners');
    
    // 이벤트 리스너 등록 (안전하게)
    icon.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('[Chatbot] Icon clicked');
      window.openChatbot();
    });
    
    closeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('[Chatbot] Close button clicked');
      window.closeChatbot();
    });
    
    console.log('[Chatbot] Event listeners attached successfully');
    
    // FAQ 기능
    let currentLang = 'ko';
    
    function renderFAQList(filterText = '') {
      if (!window.CHATBOT_DATA) {
        console.error('[Chatbot] CHATBOT_DATA not loaded');
        return;
      }
      
      if (!faqContainer) {
        console.error('[Chatbot] FAQ container not found');
        return;
      }
      
      const data = window.CHATBOT_DATA[currentLang];
      if (!data) return;

      let filteredFaqs = data.faqs;
      if (filterText) {
        const lowerFilter = filterText.toLowerCase();
        filteredFaqs = data.faqs.filter(faq => 
          faq.q.toLowerCase().includes(lowerFilter) || 
          faq.a.toLowerCase().includes(lowerFilter)
        );
      }

      faqContainer.innerHTML = filteredFaqs.map((faq, index) => `
        <div class="faq-item" data-index="${index}">
          <div class="faq-question" onclick="window.toggleFAQ(${index})">
            <span class="faq-q-text">${faq.q}</span>
            <i class="fas fa-chevron-down faq-icon"></i>
          </div>
          <div class="faq-answer">
            <div class="faq-a-text">${faq.a}</div>
          </div>
        </div>
      `).join('');

      if (filteredFaqs.length === 0) {
        faqContainer.innerHTML = `
          <div style="text-align: center; padding: 60px 20px;">
            <i class="fas fa-search" style="font-size: 48px; color: #9ca3af; margin-bottom: 12px;"></i>
            <p style="color: #6b7280; font-size: 14px;">
              ${currentLang === 'ko' ? '검색 결과가 없습니다.' :
                currentLang === 'en' ? 'No results found.' :
                currentLang === 'zh' ? '未找到结果。' :
                '検索結果がありません。'}
            </p>
          </div>
        `;
      }
    }

    window.toggleFAQ = function(index) {
      const faqItems = document.querySelectorAll('.faq-item');
      const clickedItem = faqItems[index];
      
      if (!clickedItem) return;

      const isActive = clickedItem.classList.contains('active');
      
      faqItems.forEach(item => item.classList.remove('active'));

      if (!isActive) {
        clickedItem.classList.add('active');
        
        setTimeout(() => {
          const container = document.getElementById('faqContainer');
          if (container) {
            const itemTop = clickedItem.offsetTop;
            container.scrollTo({
              top: itemTop - 20,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    };

    window.changeChatLanguage = function(lang) {
      currentLang = lang;
      
      document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      
      if (event && event.target) {
        event.target.classList.add('active');
      }
      
      const data = window.CHATBOT_DATA[currentLang];
      if (!data) return;
      
      const titleEl = document.getElementById('chatbotTitle');
      if (titleEl) titleEl.textContent = data.title;
      
      const statusEl = document.getElementById('statusText');
      if (statusEl) statusEl.textContent = data.statusOnline;
      
      const subtitleEl = document.getElementById('faqSubtitle');
      if (subtitleEl) subtitleEl.textContent = data.subtitle;
      
      if (searchInput) {
        searchInput.value = '';
        searchInput.placeholder = data.searchPlaceholder;
      }
      
      renderFAQList();
      
      console.log('[Chatbot] Language changed to:', lang);
    };

    // 검색 기능
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        renderFAQList(e.target.value.trim());
      });
    }

    // 초기 렌더링
    renderFAQList();
    
    console.log('[Chatbot] ✅ Initialization complete - All systems ready!');
  });
  
  console.log('[Chatbot] Script setup complete, waiting for DOM...');
})();
