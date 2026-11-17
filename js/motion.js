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

  /* ---------- Scroll progress ---------- */
  var bar = document.createElement('div');
  bar.className = 'scroll-progress'; bar.setAttribute('aria-hidden', 'true'); bar.innerHTML = '<i></i>';
  document.body.appendChild(bar);
  var barI = bar.firstChild;

  /* ---------- Which view a link goes to (mirrors guide.js) ---------- */
  var isGuide = !!$('[data-view]');
  function viewOf(hash) {
    var h = (hash || '#what').slice(1) || 'what';
    if (h.indexOf('help') === 0) return 'help';
    if (h.indexOf('install') === 0) return 'install';
    return ['what', 'install', 'help', 'playbook'].indexOf(h) >= 0 ? h : 'what';
  }
  function afterViewChange() {
    if (lenis) { lenis.resize(); lenis.scrollTo(window.scrollY, { immediate: true, force: true }); }
    bar.hidden = !isGuide || viewOf(location.hash) === 'install';
    ST.refresh();
  }

  /* ---------- Page changes: the new page wipes up over the old one, the header holds still ---------- */
  if (isGuide && document.startViewTransition) {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || a.target) return;
      var href = a.getAttribute('href');
      if (href === '#' || viewOf(href) === viewOf(location.hash)) return;
      e.preventDefault();
      document.startViewTransition(function () {
        history.pushState(null, '', href);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
    });
  }
  window.addEventListener('hashchange', function () { requestAnimationFrame(afterViewChange); });
  window.addEventListener('popstate', function () { requestAnimationFrame(afterViewChange); });
  bar.hidden = !isGuide || viewOf(location.hash) === 'install';   /* the Playbook shows one step per screen and has its own step count */

  /* ---------- One clock for the scroll-linked parts ---------- */
  var tickers = [];
  gsap.ticker.add(function () {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    barI.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
    for (var i = 0; i < tickers.length; i++) tickers[i]();
  });

  if (!isGuide || !$('#view-what')) return;   /* the Playbook page takes the scroll, the bar and the page changes only */

  /* ---------- Hero: the photo sits a layer deeper ---------- */
  var heroImg = $('#view-what .hero-img img');
  if (heroImg) gsap.fromTo(heroImg, { '--py': '-5%' }, { '--py': '5%', ease: 'none',
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
  if (band) gsap.fromTo(band, { '--cx': '5%', '--cr': '28px' }, { '--cx': '0%', '--cr': '0px', ease: 'none',
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
      import('./agents3d.js')   /* resolved against this script's own address, js/ */.then(function (m) { return m.start(host, cards, state); })
        .catch(function (err) { html.classList.remove('has-3d'); if (window.console) console.warn('AIOS 3D off:', err); ST.refresh(); });
    }, { rootMargin: '150% 0px' });
    io.observe(section);
    ST.refresh();
  }
})();
