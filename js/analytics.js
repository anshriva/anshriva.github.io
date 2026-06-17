// Privacy-first analytics (GoatCounter — no cookies, no consent banner needed).
//
// Pageviews/visitors are counted automatically once count.js loads. On top of
// that, this file records a small set of meaningful custom events: sidebar nav
// clicks, button/CTA clicks, chat suggestion chips, the immersive toggle, and
// outbound links (email / LinkedIn). The homepage chat also calls
// window.trackEvent('chat-question') when a question is sent (see assistant.js).
//
// One identical concern, loaded once per page via <script src=".../js/analytics.js">.
// The GoatCounter endpoint below is absolute, so this file is depth-independent;
// only the <script> src that loads it needs the right relative path per page.
(function () {
  var ENDPOINT = 'https://anshriva.goatcounter.com/count';

  // GoatCounter ignores localhost / 127.x / file:// by default, which keeps
  // production stats clean. Uncomment the block below to count local testing
  // (the allow_local flag only fires on those hosts — it's a no-op in prod).
  // var isLocal = /^(localhost|127\.|0\.0\.0\.0$)/.test(location.hostname) ||
  //               location.protocol === 'file:';
  // window.goatcounter = window.goatcounter || {};
  // if (isLocal) window.goatcounter.allow_local = true;

  // Inject GoatCounter's counter script (auto-counts the pageview on load).
  var s = document.createElement('script');
  s.async = true;
  s.src = '//gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter', ENDPOINT);
  (document.head || document.documentElement).appendChild(s);

  // ---- Custom events ------------------------------------------------------
  function slug(s) {
    return (s || '').trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  }

  // Record a custom event. Safe to call before count.js has loaded — it
  // queues by no-op; count.js defines window.goatcounter.count once ready, and
  // these clicks happen well after page load, so it's reliably available.
  function track(path, title) {
    if (window.goatcounter && typeof window.goatcounter.count === 'function') {
      window.goatcounter.count({ path: path, title: title || path, event: true });
    }
  }
  window.trackEvent = track;

  // Delegated click tracking — one listener for the whole page.
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('a, button');
    if (!el) return;

    var text = (el.textContent || '').trim();
    if (el.closest('#site-sidebar')) {
      track('nav-' + slug(text), text);
    } else if (el.classList.contains('ask-chip')) {
      track('chat-chip-' + slug(text), text);
    } else if (el.classList.contains('ask-expand')) {
      track('chat-immersive-toggle', 'Immersive toggle');
    } else if (el.classList.contains('btn')) {
      track('btn-' + slug(text), text);
    } else if (el.tagName === 'A' && el.href &&
               (/^mailto:/i.test(el.href) || el.host !== window.location.host)) {
      track('outbound-' + slug(el.host + (el.pathname || '')), el.href);
    }
  });
})();
