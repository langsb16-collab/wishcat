// 챗봇 메인 로직
(function() {
  let currentLang = 'ko';
  let chatHistory = [];

  // DOM 요소
  const chatbotIcon = document.getElementById('chatbotIcon');
  const chatbotWindow = document.getElementById('chatbotWindow');
  const closeChatbot = document.getElementById('closeChatbot');
  const chatMessages = document.getElementById('chatMessages');
  const userInput = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  const quickReplies = document.getElementById('quickReplies');
  const typingIndicator = document.getElementById('typingIndicator');

  // 초기화
  function init() {
    showWelcomeMessage();
    renderQuickReplies();
    
    // 이벤트 리스너
    chatbotIcon.addEventListener('click', openChatbot);
    closeChatbot.addEventListener('click', closeChatbotWindow);
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // 챗봇 열기
  function openChatbot() {
    chatbotWindow.classList.remove('hidden');
    chatbotIcon.style.display = 'none';
    userInput.focus();
  }

  // 챗봇 닫기
  function closeChatbotWindow() {
    chatbotWindow.classList.add('hidden');
    chatbotIcon.style.display = 'flex';
  }

  // 환영 메시지
  function showWelcomeMessage() {
    const data = window.CHATBOT_DATA[currentLang];
    addBotMessage(data.welcome);
  }

  // 빠른 답변 렌더링
  function renderQuickReplies() {
    const data = window.CHATBOT_DATA[currentLang];
    quickReplies.innerHTML = '';
    
    data.quickReplies.forEach(text => {
      const btn = document.createElement('button');
      btn.className = 'quick-reply-btn';
      btn.textContent = text;
      btn.onclick = () => handleQuickReply(text);
      quickReplies.appendChild(btn);
    });
  }

  // 빠른 답변 클릭
  function handleQuickReply(text) {
    addUserMessage(text);
    processUserMessage(text);
  }

  // 메시지 전송
  function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addUserMessage(message);
    userInput.value = '';
    processUserMessage(message);
  }

  // 사용자 메시지 추가
  function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
      <div class="message-content">
        <div class="message-text">${escapeHtml(text)}</div>
        <div class="message-time">${getTime()}</div>
      </div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
  }

  // 봇 메시지 추가
  function addBotMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.innerHTML = `
      <div class="bot-avatar">
        <i class="fas fa-robot"></i>
      </div>
      <div class="message-content">
        <div class="message-text">${text.replace(/\n/g, '<br>')}</div>
        <div class="message-time">${getTime()}</div>
      </div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
  }

  // 메시지 처리
  function processUserMessage(message) {
    showTyping();
    
    setTimeout(() => {
      hideTyping();
      const response = getAutoResponse(message.toLowerCase());
      addBotMessage(response);
    }, 800);
  }

  // 자동 응답 찾기
  function getAutoResponse(message) {
    const data = window.CHATBOT_DATA[currentLang];
    
    for (const qa of data.qa) {
      for (const keyword of qa.keywords) {
        if (message.includes(keyword.toLowerCase())) {
          return qa.answer;
        }
      }
    }
    
    return data.notFound;
  }

  // 타이핑 표시
  function showTyping() {
    typingIndicator.classList.remove('hidden');
    scrollToBottom();
  }

  function hideTyping() {
    typingIndicator.classList.add('hidden');
  }

  // 스크롤 하단으로
  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // 시간 포맷
  function getTime() {
    const now = new Date();
    return now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
  }

  // HTML 이스케이프
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
    document.getElementById('chatbotTitle').textContent = 
      lang === 'ko' ? 'FeeZero 케어봇' :
      lang === 'en' ? 'FeeZero Care Bot' :
      lang === 'zh' ? 'FeeZero 护理机器人' :
      'FeeZero ケアボット';
    
    document.getElementById('statusText').textContent = 
      lang === 'ko' ? '온라인' :
      lang === 'en' ? 'Online' :
      lang === 'zh' ? '在线' :
      'オンライン';
    
    userInput.placeholder = data.placeholder;
    
    // 빠른 답변 다시 렌더링
    renderQuickReplies();
    
    // 메시지 초기화 및 환영 메시지
    chatMessages.innerHTML = '';
    showWelcomeMessage();
    
    console.log('Language changed to:', lang);
  };

  // 초기화 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
