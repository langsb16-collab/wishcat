// 챗봇 메인 로직 - FAQ 리스트 방식 (SSR 안전 버전)

// DOMContentLoaded 보장 및 중복 초기화 방지
document.addEventListener("DOMContentLoaded", function() {
  // 중복 초기화 방지
  if (window.chatbotInitialized) {
    console.log('Chatbot already initialized');
    return;
  }
  window.chatbotInitialized = true;

  let currentLang = 'ko';

  // DOM 요소 참조
  const chatbotIcon = document.getElementById('chatbot-icon');
  const chatbotContainer = document.getElementById('chatbot-container');
  const closeBtn = document.getElementById('chatbot-close');
  const faqContainer = document.getElementById('faqContainer');
  const searchInput = document.getElementById('searchInput');

  // DOM 요소 존재 확인
  if (!chatbotIcon || !chatbotContainer || !closeBtn) {
    console.error('Chatbot elements not found');
    return;
  }

  console.log('Chatbot initialized successfully');

  // 챗봇 열기
  function openChatbot() {
    chatbotContainer.style.display = 'flex';
    setTimeout(() => {
      chatbotContainer.style.opacity = '1';
      chatbotContainer.style.transform = 'translateY(0)';
    }, 10);
    chatbotIcon.style.display = 'none';
  }

  // 챗봇 닫기
  function closeChatbot() {
    chatbotContainer.style.opacity = '0';
    chatbotContainer.style.transform = 'translateY(20px)';
    setTimeout(() => {
      chatbotContainer.style.display = 'none';
    }, 200);
    chatbotIcon.style.display = 'flex';
  }

  // 이벤트 리스너 등록
  chatbotIcon.addEventListener('click', openChatbot);
  closeBtn.addEventListener('click', closeChatbot);

  // 전역 함수로도 노출 (inline onclick 대비)
  window.openChatbot = openChatbot;
  window.closeChatbot = closeChatbot;

  // FAQ 리스트 렌더링
  function renderFAQList(filterText = '') {
    const data = window.CHATBOT_DATA[currentLang];
    if (!data || !faqContainer) return;

    // 필터링
    let filteredFaqs = data.faqs;
    if (filterText) {
      const lowerFilter = filterText.toLowerCase();
      filteredFaqs = data.faqs.filter(faq => 
        faq.q.toLowerCase().includes(lowerFilter) || 
        faq.a.toLowerCase().includes(lowerFilter)
      );
    }

    // FAQ 리스트 생성
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

    // 필터링 결과 없음 표시
    if (filteredFaqs.length === 0) {
      faqContainer.innerHTML = `
        <div class="no-results">
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

  // FAQ 토글 (전역 함수)
  window.toggleFAQ = function(index) {
    const faqItems = document.querySelectorAll('.faq-item');
    const clickedItem = faqItems[index];
    
    if (!clickedItem) return;

    const isActive = clickedItem.classList.contains('active');
    
    // 다른 모든 FAQ 닫기
    faqItems.forEach(item => {
      item.classList.remove('active');
    });

    // 클릭한 FAQ 토글
    if (!isActive) {
      clickedItem.classList.add('active');
      
      // 스크롤 애니메이션
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

  // 검색 핸들러
  function handleSearch(e) {
    const searchText = e.target.value.trim();
    renderFAQList(searchText);
  }

  // 언어 변경 (전역 함수)
  window.changeChatLanguage = function(lang) {
    currentLang = lang;
    
    // 언어 버튼 active 상태 변경
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    if (event && event.target) {
      event.target.classList.add('active');
    }
    
    // UI 업데이트
    const data = window.CHATBOT_DATA[currentLang];
    
    // 제목 업데이트
    const titleEl = document.getElementById('chatbotTitle');
    if (titleEl) {
      titleEl.textContent = data.title;
    }
    
    // 상태 텍스트 업데이트
    const statusEl = document.getElementById('statusText');
    if (statusEl) {
      statusEl.textContent = data.statusOnline;
    }
    
    // 부제목 업데이트
    const subtitleEl = document.getElementById('faqSubtitle');
    if (subtitleEl) {
      subtitleEl.textContent = data.subtitle;
    }
    
    // 검색창 placeholder 업데이트
    if (searchInput) {
      searchInput.value = '';
      searchInput.placeholder = data.searchPlaceholder;
    }
    
    // FAQ 리스트 다시 렌더링
    renderFAQList();
    
    console.log('Language changed to:', lang);
  };

  // 검색 기능 등록
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }

  // 초기 FAQ 리스트 렌더링
  renderFAQList();
});
