// ===============================
//  EmpowerBot Chat Assistant
// ===============================

// Beginner-friendly configuration:
// Hosting frontend-only on GitHub Pages → use 'groq' mode.
// Note: This exposes the key and can be blocked by CORS/provider; use for testing only.
const CHAT_MODE = 'groq'; // 'groq' | 'backend'

// If CHAT_MODE === 'backend', set your deployed backend URL here:
// Example: 'https://empowerbot-xyz.onrender.com/chat'
const BACKEND_URL = 'https://YOUR-BACKEND-URL/chat';

// If CHAT_MODE === 'groq', this test key will be used directly from the browser.
// WARNING: Do NOT commit real API keys. Use the backend or environment variables instead.
// Replace with your key for local testing only, or better: set CHAT_MODE='backend' and
// configure your backend to call Groq securely.
const GROQ_API_KEY = 'REPLACE_WITH_YOUR_GROQ_API_KEY'; // placeholder
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

class GroqChat {
  constructor() {
    this.initChat();
    this.addListeners();
  }

  initChat() {
    if (!document.getElementById('groq-chat-container')) {
      const html = `
        <div id="groq-chat-container" class="chat-container">
          <div class="chat-header">
            <h3>EmpowerBot Assistant</h3>
            <button id="chat-minimize">−</button>
          </div>
          <div id="chat-messages" class="chat-messages"></div>
          <div class="chat-input-container">
            <textarea id="chat-input" placeholder="Type your question..." rows="1"></textarea>
            <button id="chat-send">Send</button>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', html);
    }
  }

  addListeners() {
    const input = document.getElementById('chat-input');
    const send = document.getElementById('chat-send');
    const minimize = document.getElementById('chat-minimize');
    const container = document.getElementById('groq-chat-container');

    send.addEventListener('click', () => this.sendMessage());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    minimize.addEventListener('click', () => {
      container.classList.toggle('minimized');
      minimize.textContent = container.classList.contains('minimized') ? '+' : '−';
    });
  }

  async sendMessage() {
    const input = document.getElementById('chat-input');
    const send = document.getElementById('chat-send');
    const msg = input.value.trim();
    if (!msg) return;

    this.addMessage(msg, 'user');
    input.value = '';
    input.disabled = true;
    send.disabled = true;
    const typing = this.showTyping();

    try {
      let reply = '';

      if (CHAT_MODE === 'backend') {
        if (!BACKEND_URL || BACKEND_URL.includes('YOUR-BACKEND-URL')) {
          throw new Error('Please set BACKEND_URL to your deployed server URL.');
        }
        const res = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg })
        });
        this.removeTyping(typing);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        reply = data.response || 'Sorry, I didn’t understand that.';
      } else {
        // Direct Groq call (testing only)
        const res = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              {
                role: 'system',
                content: "You are EmpowerBot — a friendly assistant that helps users understand and use the website."
              },
              { role: 'user', content: msg }
            ],
            temperature: 0.7,
            max_tokens: 512
          })
        });
        this.removeTyping(typing);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        reply = data.choices?.[0]?.message?.content || 'Sorry, I didn’t understand that.';
      }

      this.addMessage(reply, 'assistant');

    } catch (err) {
      console.error('Chat error:', err);
      this.removeTyping(typing);
      this.addMessage(`⚠️ Error contacting chat service: ${String(err && err.message || err)}`, 'assistant');
    } finally {
      input.disabled = false;
      send.disabled = false;
      input.focus();
    }
  }

  addMessage(text, role) {
    const box = document.getElementById('chat-messages');
    const msg = document.createElement('div');
    msg.className = `chat-message ${role}-message`;
    msg.innerHTML = this.formatText(text);
    box.appendChild(msg);
    box.scrollTop = box.scrollHeight;
  }

  formatText(text) {
    const safe = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const linked = safe.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    return linked.replace(/\n/g, '<br>');
  }

  showTyping() {
    const id = 'typing-' + Date.now();
    const html = `<div id="${id}" class="chat-message assistant-message typing-indicator"><span></span><span></span><span></span></div>`;
    const box = document.getElementById('chat-messages');
    box.insertAdjacentHTML('beforeend', html);
    box.scrollTop = box.scrollHeight;
    return id;
  }

  removeTyping(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }
}

document.addEventListener('DOMContentLoaded', () => new GroqChat());
