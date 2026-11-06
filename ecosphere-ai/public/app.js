(() => {
  const WELCOME_MESSAGE =
    "Hello! I'm EcoSphere AI. Ask me anything about environmental protection and sustainable living.";

  const messagesEl = document.getElementById('messages');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const clearBtn = document.getElementById('clear-btn');

  // Conversation history sent to the server (user + assistant turns only).
  let history = [];
  let isWaiting = false;

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // Text is inserted with textContent, so model output is never rendered as HTML.
  function addMessage(role, text) {
    const row = document.createElement('div');
    row.className = `message ${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;

    row.appendChild(bubble);
    messagesEl.appendChild(row);
    scrollToBottom();
    return row;
  }

  function showTypingIndicator() {
    const row = document.createElement('div');
    row.className = 'message assistant typing';
    row.setAttribute('aria-label', 'EcoSphere AI is typing');

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      dot.className = 'typing-dot';
      bubble.appendChild(dot);
    }

    row.appendChild(bubble);
    messagesEl.appendChild(row);
    scrollToBottom();
    return row;
  }

  function setBusy(busy) {
    isWaiting = busy;
    sendBtn.disabled = busy;
    input.disabled = busy;
    clearBtn.disabled = busy;
    if (!busy) input.focus();
  }

  function autoResizeInput() {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
  }

  function resetConversation() {
    history = [];
    messagesEl.innerHTML = '';
    addMessage('assistant', WELCOME_MESSAGE);
    input.value = '';
    autoResizeInput();
    input.focus();
  }

  async function requestReply() {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    });

    let data = {};
    try {
      data = await response.json();
    } catch (_) {
      // Non-JSON response; handled below.
    }

    if (!response.ok) {
      throw new Error(data.error || `The server returned an error (status ${response.status}).`);
    }
    if (!data.reply) {
      throw new Error('The AI returned an empty response. Please try again.');
    }
    return data.reply;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isWaiting) return;

    input.value = '';
    autoResizeInput();
    addMessage('user', text);
    history.push({ role: 'user', content: text });

    setBusy(true);
    const typingRow = showTypingIndicator();

    try {
      const reply = await requestReply();
      typingRow.remove();
      history.push({ role: 'assistant', content: reply });
      addMessage('assistant', reply);
    } catch (err) {
      typingRow.remove();
      // Drop the unanswered user turn so the conversation stays consistent and can be retried.
      history.pop();
      input.value = text;
      autoResizeInput();

      const message =
        err instanceof TypeError
          ? 'Cannot reach the EcoSphere server. Please check your connection and try again.'
          : err.message;
      addMessage('error', message);
    } finally {
      setBusy(false);
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage();
  });

  // Enter sends; Shift+Enter inserts a new line.
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      sendMessage();
    }
  });

  input.addEventListener('input', autoResizeInput);

  clearBtn.addEventListener('click', () => {
    if (!isWaiting) resetConversation();
  });

  resetConversation();
})();
