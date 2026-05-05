(function () {
  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #wgw-chat-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      background: #1a3c6e; color: #fff; border: none; border-radius: 50px;
      padding: 14px 20px; font-size: 15px; font-weight: 600; cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 8px;
      font-family: 'Inter', sans-serif; transition: background 0.2s;
    }
    #wgw-chat-btn:hover { background: #e87722; }
    #wgw-chat-window {
      position: fixed; bottom: 90px; right: 24px; z-index: 9999;
      width: 340px; max-height: 500px; background: #fff; border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18); display: none; flex-direction: column;
      font-family: 'Inter', sans-serif; overflow: hidden;
    }
    #wgw-chat-window.open { display: flex; }
    #wgw-chat-header {
      background: #1a3c6e; color: #fff; padding: 14px 16px;
      font-weight: 700; font-size: 15px; display: flex; justify-content: space-between; align-items: center;
    }
    #wgw-chat-header span { font-size: 13px; font-weight: 400; opacity: 0.8; }
    #wgw-chat-close { cursor: pointer; font-size: 20px; line-height: 1; }
    #wgw-chat-messages {
      flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px;
      min-height: 200px; max-height: 320px;
    }
    .wgw-msg { max-width: 85%; padding: 10px 13px; border-radius: 12px; font-size: 14px; line-height: 1.45; }
    .wgw-msg.bot { background: #f0f4f8; color: #1a1a1a; align-self: flex-start; border-bottom-left-radius: 4px; }
    .wgw-msg.user { background: #1a3c6e; color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
    .wgw-msg.typing { opacity: 0.6; font-style: italic; }
    #wgw-chat-form { display: flex; border-top: 1px solid #eee; padding: 10px; gap: 8px; }
    #wgw-chat-input {
      flex: 1; border: 1px solid #ddd; border-radius: 8px; padding: 8px 12px;
      font-size: 14px; font-family: 'Inter', sans-serif; outline: none;
    }
    #wgw-chat-input:focus { border-color: #1a3c6e; }
    #wgw-chat-send {
      background: #1a3c6e; color: #fff; border: none; border-radius: 8px;
      padding: 8px 14px; cursor: pointer; font-size: 14px; font-weight: 600;
      transition: background 0.2s;
    }
    #wgw-chat-send:hover { background: #e87722; }
    #wgw-chat-send:disabled { opacity: 0.5; cursor: not-allowed; }
    @media (max-width: 420px) {
      #wgw-chat-window { width: calc(100vw - 32px); right: 16px; }
      #wgw-chat-btn { right: 16px; bottom: 16px; }
    }
  `;
  document.head.appendChild(style);

  // Build widget HTML
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <button id="wgw-chat-btn">🚗 Ask Us Anything</button>
    <div id="wgw-chat-window">
      <div id="wgw-chat-header">
        <div>Wheelie Good Wheels 🚗<br><span>AI Assistant — reply in seconds</span></div>
        <span id="wgw-chat-close">✕</span>
      </div>
      <div id="wgw-chat-messages">
        <div class="wgw-msg bot">Hi! I'm the Wheelie Good Wheels assistant. Ask me anything about our cars, rental process, or pickup locations! 🚗</div>
      </div>
      <form id="wgw-chat-form">
        <input id="wgw-chat-input" type="text" placeholder="Type your question..." autocomplete="off" />
        <button id="wgw-chat-send" type="submit">Send</button>
      </form>
    </div>
  `;
  document.body.appendChild(wrapper);

  const btn = document.getElementById('wgw-chat-btn');
  const win = document.getElementById('wgw-chat-window');
  const closeBtn = document.getElementById('wgw-chat-close');
  const form = document.getElementById('wgw-chat-form');
  const input = document.getElementById('wgw-chat-input');
  const send = document.getElementById('wgw-chat-send');
  const messages = document.getElementById('wgw-chat-messages');
  let history = [];

  btn.addEventListener('click', () => { win.classList.toggle('open'); if (win.classList.contains('open')) input.focus(); });
  closeBtn.addEventListener('click', () => win.classList.remove('open'));

  function addMsg(text, role) {
    const div = document.createElement('div');
    div.className = 'wgw-msg ' + role;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    send.disabled = true;

    addMsg(text, 'user');
    history.push({ role: 'user', text });

    const typing = addMsg('Thinking...', 'bot typing');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history.slice(-6) })
      });
      const data = await res.json();
      const reply = data.reply || 'Sorry, something went wrong. Please try again!';
      typing.textContent = reply;
      typing.classList.remove('typing');
      history.push({ role: 'model', text: reply });
    } catch {
      typing.textContent = 'Oops! Something went wrong. Please try again.';
      typing.classList.remove('typing');
    }

    send.disabled = false;
    input.focus();
  });
})();
