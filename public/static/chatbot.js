// 챗봇 메인 로직 - FAQ 리스트 방식
(function() {
  let currentLang = 'ko';

  // DOM 요소
  const chatbotIcon = document.getElementById('chatbotIcon');
  const chatbotWindow = document.getElementById('chatbotWindow');
  const closeChatbot = document.getElementById('closeChatbot');
  const faqContainer = document.getElementById('faqContainer');
  const searchInput = document.getElementById('searchInput');

  // 초기화
  function init() {
    renderFAQList();
    
    // 이벤트 리스너
    chatbotIcon.addEventListener('click', openChatbot);
    closeChatbot.addEventListener('click', closeChatbotWindow);
    
    // 검색 기능
    if (searchInput) {
      searchInput.addEventListener('input', handleSearch);
    }
  }

  // 챗봇 열기
  function openChatbot() {
    chatbotWindow.classList.remove('hidden');
    chatbotIcon.style.display = 'none';
  }

  // 챗봇 닫기
  function closeChatbotWindow() {
    chatbotWindow.classList.add('hidden');
    chatbotIcon.style.display = 'flex';
  }

  // 전역 함수로 노출 (inline onclick을 위해)
  window.openChatbot = openChatbot;
  window.closeChatbotWindow = closeChatbotWindow;

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
        const itemTop = clickedItem.offsetTop;
        container.scrollTo({
          top: itemTop - 20,
          behavior: 'smooth'
        });
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
    event.target.classList.add('active');
    
    // UI 업데이트
    const data = window.CHATBOT_DATA[currentLang];
    
    // 제목 업데이트
    document.getElementById('chatbotTitle').textContent = data.title;
    
    // 상태 텍스트 업데이트
    document.getElementById('statusText').textContent = data.statusOnline;
    
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

  // 초기화 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
