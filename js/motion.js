/* AIOS guide: the motion layer (v3, 2026-11-17). Loaded after guide.js / playbook.js and never changes what they do.
   GSAP 3.15.0 + ScrollTrigger + CustomEase and Lenis 1.3.27 are kept in /vendor (nothing loaded from elsewhere);
   three.js is loaded only when the four agents come near the screen (js/agents3d.js).
   Values and their sources: css/motion.css and the vault's CSC Motion Kit. With reduced motion asked for, none of it runs. */
(function () {
  'use strict';
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (RM || !window.gsap || !window.ScrollTrigger) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  if (window.CustomEase) { gsap.registerPlugin(window.CustomEase); window.CustomEase.create('csc-enter', '0.19,1,0.22,1'); window.CustomEase.create('csc-move', '0.65,0.05,0,1'); }
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $all = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var html = document.documentElement;
  html.classList.add('m-on');

  /* ---------- Smooth scroll (Grids' exact settings; phones keep their own scrolling) ---------- */
  var lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true, syncTouch: false, autoRaf: false, anchors: false });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    $all('#zoom, #vmodal, #all-steps, .vmodal, .zoom').forEach(function (el) { el.setAttribute('data-lenis-prevent', ''); });
  }
  window.AIOS_MOTION = { lenis: lenis };

  /* (The thin scroll bar along the top is gone: "no progress bars" is one of mrhsi's 20 rules, and the install keeps
     its own step count, which is information, not decoration.) */

  /* ---------- Which view a link goes to (mirrors guide.js; the order lives in the page's <head>) ---------- */
  var isGuide = !!$('[data-view]:not(html)'), inVT = false;
  var VIEW = window.AIOS_VIEW || { order: { what: 0, install: 1, playbook: 2, help: 3 }, of: function () { return 'what'; } };
  function viewOf(hash) {
    var h = (hash || '#what').slice(1) || 'what';
    if (h.indexOf('help') === 0) return 'help';
    if (h.indexOf('install') === 0) return 'install';
    return ['what', 'install', 'help', 'playbook'].indexOf(h) >= 0 ? h : 'what';
  }
  function afterViewChange() {
    if (lenis) { lenis.resize(); lenis.scrollTo(window.scrollY, { immediate: true, force: true }); }
    ST.refresh();
  }

  /* ---------- Page changes: forward, the new page rises over the old one as the old one recedes into the page;
     back, the same thing reversed and quicker. The header holds still either way. ---------- */
  if (isGuide && document.startViewTransition) {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || a.target) return;
      var href = a.getAttribute('href'), from = viewOf(location.hash), to = viewOf(href);
      if (href === '#' || to === from) return;
      e.preventDefault();
      html.setAttribute('data-vt', VIEW.order[to] < VIEW.order[from] ? 'back' : 'fwd');
      var vt = document.startViewTransition(function () {
        inVT = true;
        try { history.pushState(null, '', href); window.dispatchEvent(new HashChangeEvent('hashchange')); }
        finally { inVT = false; }
      });
      vt.ready.catch(function () { /* a quick second click skips this one: fine */ });
      vt.finished.finally(function () { html.removeAttribute('data-vt'); });
    });

    /* Browser Back and Forward (the arrows top-left, Alt+arrow, a two-finger swipe): the same moves, by where you
       are going. The URL has already changed but the page has not, so the old page is still on screen to be
       pictured; guide.js hands its page change over (onRoute) and it runs inside the transition. */
    var holding = false;
    window.AIOS_DEFER_ROUTE = function (from, to, run) {
      if (inVT) return false;              /* our own click: already inside a transition */
      if (holding) return true;            /* popstate and hashchange both arrive: one change, not two */
      holding = true;
      html.setAttribute('data-vt', VIEW.order[to] < VIEW.order[from] ? 'back' : 'fwd');
      var vt = document.startViewTransition(function () { holding = false; inVT = true; try { run(); } finally { inVT = false; } });
      vt.ready.catch(function () { /* skipped: the page still changes */ });
      vt.updateCallbackDone.catch(function () { /* reported in the console by the page change itself */ });
      vt.finished.finally(function () { holding = false; html.removeAttribute('data-vt'); });
      return true;
    };
  }
  window.addEventListener('hashchange', function () { requestAnimationFrame(afterViewChange); });
  window.addEventListener('popstate', function () { requestAnimationFrame(afterViewChange); });

  /* ---------- One clock for the scroll-linked parts ---------- */
  var tickers = [];
  gsap.ticker.add(function () { for (var i = 0; i < tickers.length; i++) tickers[i](); });

  /* ---------- The Playbook, reached from the four agents: one click back to them, wherever you are ---------- */
  if (!isGuide) {
    var fromAgents = /[?&]from=agents\b/.test(location.search);
    try { if (fromAgents) sessionStorage.setItem('aios-from-agents', '1'); else fromAgents = sessionStorage.getItem('aios-from-agents') === '1'; } catch (e) { /* fine */ }
    if (fromAgents) {
      var back = document.createElement('a');
      back.className = 'back-chip'; back.href = 'index.html#what-agents'; back.setAttribute('data-kind', 'back');
      back.innerHTML = '<span class="arw" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M2 8h11M9 4l4 4-4 4"/></svg></span>Back to the four agents';
      document.body.appendChild(back);
      requestAnimationFrame(function () { back.classList.add('is-in'); });
    }
    return;   /* the Playbook page takes the scroll and the page changes only */
  }
  if (!$('#view-what')) return;

  /* ---------- Hero: the photo sits a layer deeper ---------- */
  var heroImg = $('#view-what .hero-img img');
  if (heroImg) gsap.fromTo(heroImg, { '--py': '-2%' }, { '--py': '2%', ease: 'none',
    scrollTrigger: { trigger: '#view-what .hero', start: 'top top', end: 'bottom top', scrub: 0.15 } });

  /* ---------- The one highlighted phrase ---------- */
  var em = $('#view-what .section-white h2 .em');
  if (em) { em.classList.add('hl'); ST.create({ trigger: em, start: 'top 72%', once: true, onEnter: function () { em.classList.add('is-in'); } }); }

  /* ---------- The promise: a line draws down the steps; each number fills as you reach it ---------- */
  var ol = $('#view-what .promise ol');
  if (ol) {
    gsap.fromTo(ol, { '--p': 0 }, { '--p': 1, ease: 'none', scrollTrigger: { trigger: ol, start: 'top 65%', end: 'bottom 60%', scrub: 0.55 } });
    $all('li', ol).forEach(function (li) { ST.create({ trigger: li, start: 'top 62%', toggleClass: { targets: li, className: 'is-on' } }); });
  }

  /* ---------- The morning brief writes itself in, line by line ---------- */
  var brief = $('#view-what .brief-card');
  if (brief) {
    var lines = $all('.inner > :not(dl), .inner dl > *, .foot', brief);
    gsap.from(lines, { y: 14, opacity: 0, duration: 0.7, ease: 'csc-enter', stagger: 0.07, delay: 0.35,
      scrollTrigger: { trigger: brief, start: 'top 68%', once: true } });
  }

  /* ---------- The closing band opens to full width as it arrives ---------- */
  var band = $('#view-what .section-mint');
  if (band) gsap.fromTo(band, { '--cx': '5%' }, { '--cx': '0%', ease: 'none',   /* sharp corners throughout (mrhsi) */
    scrollTrigger: { trigger: band, start: 'top bottom', end: 'top 30%', scrub: 0.55 } });

  /* ---------- The four agents ---------- */
  setupAgents();

  function webglOK() {
    try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); }
    catch (e) { return false; }
  }
  function setupAgents() {
    var grid = $('#view-what .agents');
    if (!grid || !webglOK()) return;
    var section = grid.closest('.section');
    var cards = $all('.agent', grid);
    var host = $('.agents-3d', section);
    if (!host || cards.length !== 4) return;
    html.classList.add('has-3d');

    var state = { f: 0, s: 0, goTo: goTo };
    var counter = $('.counter .n span', host), focus = -1;
    function centerLine() { return window.innerWidth >= 900 ? window.innerHeight * 0.5 : window.innerHeight * 0.72; }
    function measure() {
      if (section.offsetParent === null) return;   /* the page is not showing */
      var vc = centerLine(), c = cards.map(function (k) { var r = k.getBoundingClientRect(); return r.top + r.height / 2; });
      var f;
      if (vc <= c[0]) f = 0; else if (vc >= c[3]) f = 3;
      else for (var i = 0; i < 3; i++) if (vc < c[i + 1]) { f = i + (vc - c[i]) / (c[i + 1] - c[i]); break; }
      state.f = f;
      state.s = Math.min(1, Math.max(0, 1 - (c[0] - vc) / (window.innerHeight * 0.85)));
      var fi = state.s > 0.6 ? Math.round(f) : -1;
      if (fi !== focus) {
        focus = fi;
        cards.forEach(function (k, j) { k.classList.toggle('is-active', j === fi); });
        if (counter) counter.style.transform = 'translateY(' + (-Math.max(0, fi) * 25) + '%)';
      }
    }
    function goTo(i) {
      var k = cards[i], vc = centerLine();
      var top = k.getBoundingClientRect().top + window.scrollY - (vc - k.offsetHeight / 2);
      if (lenis) lenis.scrollTo(top, { duration: 1.4, easing: function (t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); } });
      else window.scrollTo({ top: top, behavior: 'smooth' });
    }
    tickers.push(measure);

    /* three.js arrives only when this part is near the screen */
    var loading = false;
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting || loading) return;
      loading = true; io.disconnect();
      import('./agents3d.js?v=34')   /* resolved against this script's own address, js/ */.then(function (m) { return m.start(host, cards, state); })
        .catch(function (err) { html.classList.remove('has-3d'); if (window.console) console.warn('AIOS 3D off:', err); ST.refresh(); });
    }, { rootMargin: '150% 0px' });
    io.observe(section);
    ST.refresh();
  }
})();
