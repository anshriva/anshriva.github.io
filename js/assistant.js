// Ask-about-me assistant — hero chat for the homepage.
// Mounts into #ask-hero (the homepage hero). Forwards questions to a Cloudflare
// Worker (worker/portfolio-bot.js) that holds the Gemini key and grounds answers
// in the live portfolio. The key is NEVER here — only the public Worker URL.
(function () {
  const mount = document.getElementById('ask-hero');
  if (!mount) return; // only runs where the hero chat exists

  // ---- Config -------------------------------------------------------------
  const WORKER_URL = 'https://portfolio-bot.anubhav-workemail.workers.dev';

  const SUGGESTIONS = [
    'Walk me through the authoring-stack redesign',
    'What has he owned end to end?',
    'How does he operate across teams?',
    "What's his experience with distributed systems?",
    'How do I get in touch?',
  ];

  const GREETING = "Ask me anything about Anubhav's work — the platforms he's owned, the decisions and trade-offs behind each one, or anything else in his background. I answer from his full portfolio.";

  // ---- State --------------------------------------------------------------
  const history = []; // [{ role: 'user'|'model', text }]
  let pending = false;
  let immersive = false;

  // ---- DOM build ----------------------------------------------------------
  mount.innerHTML = [
    '<div class="ask-card">',
    '  <div class="ask-bar">',
    '    <span class="ask-bar-title"><span aria-hidden="true">✨</span> Ask about my work</span>',
    '    <button class="ask-expand" type="button" aria-label="Expand to full screen">⤢ Immersive</button>',
    '  </div>',
    '  <div class="ask-log" aria-live="polite"></div>',
    '  <form class="ask-form">',
    '    <input type="text" placeholder="Ask a question…" autocomplete="off" aria-label="Your question" />',
    '    <button type="submit">Send</button>',
    '  </form>',
    '</div>',
  ].join('');

  const card = mount.querySelector('.ask-card');
  const log = mount.querySelector('.ask-log');
  const form = mount.querySelector('.ask-form');
  const input = form.querySelector('input');
  const sendBtn = form.querySelector('button');
  const expandBtn = mount.querySelector('.ask-expand');

  // ---- Rendering ----------------------------------------------------------
  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  // Lightweight, safe markdown rendering: escape first, then re-introduce a
  // small set of formatting (bold, links, bullet/numbered lists, paragraphs).
  function renderText(text) {
    const blocks = text.split(/\n{2,}/);
    let html = '';
    for (const block of blocks) {
      const lines = block.split('\n');
      const isBullet = lines.every((l) => /^\s*[-*]\s+/.test(l) || l.trim() === '');
      const isNumbered = lines.every((l) => /^\s*\d+[.)]\s+/.test(l) || l.trim() === '');
      if (isBullet && block.trim()) {
        html += '<ul>' + lines.filter((l) => l.trim()).map((l) =>
          '<li>' + inline(l.replace(/^\s*[-*]\s+/, '')) + '</li>').join('') + '</ul>';
      } else if (isNumbered && block.trim()) {
        html += '<ol>' + lines.filter((l) => l.trim()).map((l) =>
          '<li>' + inline(l.replace(/^\s*\d+[.)]\s+/, '')) + '</li>').join('') + '</ol>';
      } else {
        html += '<p>' + inline(escapeHtml(block)).replace(/\n/g, '<br>') + '</p>';
      }
    }
    return html;
  }

  function inline(s) {
    // s may already be escaped (paragraph path) or raw (list path) — escape if raw
    let out = s.indexOf('<') === -1 && s.indexOf('&lt;') === -1 ? escapeHtml(s) : s;
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>');
    out = out.replace(/(^|[^"'>=])((?:https?:\/\/|mailto:)[^\s<]+)/g,
      '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
    return out;
  }

  function addMsg(text, kind) {
    const el = document.createElement('div');
    el.className = 'ask-msg ' + kind;
    if (kind === 'bot') el.innerHTML = renderText(text);
    else el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  function addSuggestions() {
    const wrap = document.createElement('div');
    wrap.className = 'ask-suggestions';
    SUGGESTIONS.forEach(function (q) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'ask-chip';
      chip.textContent = q;
      chip.addEventListener('click', function () {
        if (pending) return;
        wrap.remove();
        ask(q);
      });
      wrap.appendChild(chip);
    });
    log.appendChild(wrap);
  }

  // Greet immediately so the hero isn't empty.
  addMsg(GREETING, 'bot');
  addSuggestions();

  // ---- Immersive mode -----------------------------------------------------
  function setImmersive(on) {
    immersive = on;
    card.classList.toggle('immersive', on);
    document.body.classList.toggle('ask-immersive-active', on);
    expandBtn.textContent = on ? '✕ Close' : '⤢ Immersive';
    expandBtn.setAttribute('aria-label', on ? 'Exit full screen' : 'Expand to full screen');
    if (on) input.focus();
    log.scrollTop = log.scrollHeight;
  }

  // ---- Network ------------------------------------------------------------
  async function ask(question) {
    addMsg(question, 'user');
    pending = true;
    sendBtn.disabled = true;
    input.value = '';

    const typing = addMsg('Thinking…', 'typing');

    if (!WORKER_URL) {
      typing.remove();
      addMsg("The assistant isn't connected yet. Reach Anubhav at anubhav.workemail@gmail.com or on LinkedIn (linkedin.com/in/anubhavsri).", 'error');
      pending = false; sendBtn.disabled = false; return;
    }

    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question, history: history }),
      });
      typing.remove();
      if (!res.ok) {
        // Surface the Worker's message and the raw upstream detail.
        let msg = 'Something went wrong reaching the assistant. You can email Anubhav at anubhav.workemail@gmail.com or connect on LinkedIn.';
        let detail = '';
        try { const e = await res.json(); if (e && e.error) msg = e.error; if (e && e.detail) detail = e.detail; } catch (_) {}
        const el = addMsg(msg, 'error');
        if (detail) {
          const pre = document.createElement('pre');
          pre.className = 'ask-error-detail';
          pre.textContent = detail;
          el.appendChild(pre);
          log.scrollTop = log.scrollHeight;
        }
        return;
      }
      if (!res.body) throw new Error('no response body');

      // Stream tokens as they arrive, re-rendering the answer live.
      const botEl = addMsg('', 'bot');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        botEl.innerHTML = renderText(full);
        log.scrollTop = log.scrollHeight;
      }
      if (full.trim()) {
        // Record the exchange only on success, so a failed turn never leaves a
        // dangling user message that breaks role alternation on the next call.
        history.push({ role: 'user', text: question });
        history.push({ role: 'model', text: full });
      } else {
        botEl.innerHTML = renderText("Sorry, I couldn't generate an answer just now. Reach Anubhav at anubhav.workemail@gmail.com.");
      }
    } catch (err) {
      typing.remove();
      addMsg("Something went wrong reaching the assistant. You can email Anubhav at anubhav.workemail@gmail.com or connect on LinkedIn.", 'error');
    } finally {
      pending = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  // ---- Wiring -------------------------------------------------------------
  expandBtn.addEventListener('click', function () { setImmersive(!immersive); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && immersive) setImmersive(false);
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const q = input.value.trim();
    if (!q || pending) return;
    ask(q);
  });
})();
