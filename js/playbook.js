/* The AIOS Playbook: a guided path, one step at a time, in order (Welcome, How it works, the four agents,
   Your first week). Same motion as the install guide: the step you leave slides away in 120 ms where it
   stood, the next one arrives part by part (80 ms apart), headings rise word by word. Every move is a
   transform or an opacity change, so nothing can stutter. Reduced motion: everything is simply there. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $all = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var motion = !reduce;
  if (motion) document.documentElement.classList.add('motion');
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  var screens = $all('.screen');
  var stage = $('.stage'), ghostLayer = $('#ghost');
  var KEY = 'aios-pb-step', current = -1;

  /* ---------- eased scrolling (the house curve, expo-out), cancelled the moment the reader scrolls ---------- */
  var scrollAnim = null;
  function easeOutExpo(t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  function glideTo(y, done) {
    y = Math.max(0, Math.min(y, document.documentElement.scrollHeight - window.innerHeight));
    var from = window.pageYOffset, dist = y - from;
    if (scrollAnim) cancelAnimationFrame(scrollAnim.raf);
    if (!motion || Math.abs(dist) < 2) { window.scrollTo(0, y); if (done) done(); return; }
    var dur = Math.min(1100, 520 + Math.abs(dist) * 0.12), start = performance.now();
    var me = scrollAnim = { raf: 0 };
    function off() { window.removeEventListener('wheel', stop); window.removeEventListener('touchstart', stop); window.removeEventListener('keydown', stop); }
    function stop() { cancelAnimationFrame(me.raf); off(); }
    window.addEventListener('wheel', stop, { passive: true }); window.addEventListener('touchstart', stop, { passive: true }); window.addEventListener('keydown', stop);
    (function frame(now) {
      var t = Math.min(1, (now - start) / dur);
      window.scrollTo(0, from + dist * easeOutExpo(t));
      if (t < 1) me.raf = requestAnimationFrame(frame); else { off(); scrollAnim = null; if (done) done(); }
    })(start);
  }
  function topOf(el) { return el.getBoundingClientRect().top + window.pageYOffset; }
  function barH() { var p = $('.progress'); return p && getComputedStyle(p).position === 'sticky' ? p.offsetHeight : 0; }


  /* ---------- smooth wheel scrolling (CSC Motion Kit 9, measured on Grids and Lando: lerp 0.1, wheel only).
     Touch, keyboard and the scrollbar stay native; a scroll from any of them simply becomes the new target.
     Not created at all under reduced motion (Agrumea's rule). Never takes over a box that scrolls on its own. ---------- */
  var wheel = { y: window.pageYOffset, target: window.pageYOffset, raf: 0, on: false };
  function canScrollInside(el, dy) {
    for (; el && el.nodeType === 1 && el !== document.body; el = el.parentElement) {
      var cs = getComputedStyle(el), oy = cs.overflowY;
      if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight) {
        if ((dy > 0 && el.scrollTop + el.clientHeight < el.scrollHeight) || (dy < 0 && el.scrollTop > 0)) return true;
      }
    }
    return false;
  }
  function wheelFrame() {
    wheel.y += (wheel.target - wheel.y) * 0.1;
    if (Math.abs(wheel.target - wheel.y) < 0.5) { wheel.y = wheel.target; wheel.on = false; }
    window.scrollTo(0, wheel.y);
    if (wheel.on) wheel.raf = requestAnimationFrame(wheelFrame);
  }
  if (motion) {
    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey || e.defaultPrevented || Math.abs(e.deltaX) > Math.abs(e.deltaY) || canScrollInside(e.target, e.deltaY)) return;
      e.preventDefault();
      if (scrollAnim) { cancelAnimationFrame(scrollAnim.raf); scrollAnim = null; }
      var d = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? window.innerHeight : 1);
      if (!wheel.on) wheel.y = window.pageYOffset;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      wheel.target = Math.max(0, Math.min(max, (wheel.on ? wheel.target : wheel.y) + d));
      if (!wheel.on) { wheel.on = true; wheel.raf = requestAnimationFrame(wheelFrame); }
    }, { passive: false });
    window.addEventListener('scroll', function () { if (!wheel.on) { wheel.y = wheel.target = window.pageYOffset; } }, { passive: true });
  }

  /* ---------- words rise through a mask (same split as the install guide) ---------- */
  function split(el) {
    if (!el || el.dataset.splitDone) return;
    el.dataset.splitDone = '1';
    var kids = Array.prototype.slice.call(el.childNodes), group = null, frag = document.createDocumentFragment();
    function open() { if (!group) { var m = document.createElement('span'); m.className = 'wm'; group = document.createElement('span'); group.className = 'wi'; m.appendChild(group); frag.appendChild(m); } return group; }
    kids.forEach(function (n) {
      if (n.nodeType === 3) {
        n.nodeValue.split(/(\s+)/).forEach(function (piece) {
          if (!piece) return;
          if (/^\s+$/.test(piece)) { group = null; frag.appendChild(document.createTextNode(piece)); }
          else open().appendChild(document.createTextNode(piece));
        });
      } else if (n.nodeName === 'BR') { group = null; frag.appendChild(n); }
      else { open().appendChild(n); }
    });
    el.textContent = ''; el.appendChild(frag);
  }
  function lineDelays(el, base) {
    var tops = [], words = $all('.wm', el);
    words.forEach(function (w) { var t = Math.round(w.offsetTop); if (tops.indexOf(t) < 0) tops.push(t); });
    tops.sort(function (a, b) { return a - b; });
    words.forEach(function (w) { w.firstChild.style.setProperty('--d', (base + tops.indexOf(Math.round(w.offsetTop)) * 50) + 'ms'); });
  }

  /* ---------- arriving and leaving ---------- */
  var cleanTimer;
  function animateIn(scr, dir) {
    if (!motion) return;
    $all('[data-split]', scr).forEach(function (el) { split(el); lineDelays(el, 40); });
    var vh = window.innerHeight;
    $all('.st', scr).forEach(function (it, i) {
      it.style.setProperty('--d', Math.min(120 + i * 80, 520) + 'ms');
      it.classList.toggle('below', it.getBoundingClientRect().top > vh); /* parts below the fold don't wait for an entrance nobody sees */
    });
    scr.classList.remove('in-fwd', 'in-back'); void scr.offsetWidth;
    scr.classList.add(dir === 'back' ? 'in-back' : 'in-fwd');
    clearTimeout(cleanTimer);
    cleanTimer = setTimeout(function () { scr.classList.remove('in-fwd', 'in-back'); }, 1500);
  }
  function ghost(old, dir, offset) {
    if (!motion || !old) return;
    var copy = old.cloneNode(true);
    copy.removeAttribute('id'); copy.hidden = false;
    $all('[id]', copy).forEach(function (n) { n.removeAttribute('id'); });
    copy.classList.remove('in-fwd', 'in-back'); copy.classList.add(dir === 'back' ? 'out-back' : 'out-fwd');
    copy.setAttribute('inert', ''); copy.style.top = -offset + 'px';
    ghostLayer.textContent = ''; ghostLayer.appendChild(copy);
    var done = function () { if (copy.parentNode) copy.parentNode.removeChild(copy); };
    copy.addEventListener('animationend', function (e) { if (e.target === copy) done(); });
    setTimeout(done, 400);
  }

  /* ---------- the progress bar ---------- */
  function progress(i) {
    $('#p-n').textContent = i + 1;
    $('#p-name').textContent = screens[i].getAttribute('data-title');
    $all('.seg').forEach(function (s, k) { s.classList.toggle('done', k <= i); });
    /* Kareem's tabs: the one you are on is marked, and the ink line under it slides across to the next. */
    var tab = null;
    $all('.pb-tab').forEach(function (t, k) { var on = k === i; if (on) { t.setAttribute('aria-current', 'step'); tab = t; } else t.removeAttribute('aria-current'); });
    var ink = $('.pb-ink'), track = $('.pb-tabs-track');
    if (tab && ink && track) {
      ink.style.setProperty('--x', tab.offsetLeft + 'px'); ink.style.setProperty('--w', tab.offsetWidth + 'px');
      var left = tab.offsetLeft - (track.clientWidth - tab.offsetWidth) / 2;
      if (track.scrollWidth > track.clientWidth) { try { track.scrollTo({ left: left, behavior: motion ? 'smooth' : 'auto' }); } catch (e) { track.scrollLeft = left; } }
    }
  }
  window.addEventListener('resize', function () { progress(current); });

  /* ---------- go to a step ---------- */
  function go(i, opts) {
    opts = opts || {};
    i = Math.max(0, Math.min(screens.length - 1, i));
    if (i === current) { if (opts.then) opts.then(); return; }
    var dir = i < current ? 'back' : 'fwd', old = screens[current];
    var stageTop = topOf(stage) - barH(), y = window.pageYOffset, offset = Math.max(0, y - stageTop);
    if (wheel.on) { cancelAnimationFrame(wheel.raf); wheel.on = false; }
    ghost(old, dir, offset);
    if (old) old.hidden = true;
    else screens.forEach(function (sc, k) { sc.hidden = k !== i; });
    screens[i].hidden = false;
    if (y > stageTop) window.scrollTo(0, stageTop);
    current = i;
    progress(i);
    store(KEY, String(i));
    if (!opts.fromHistory) { try { history[opts.replace ? 'replaceState' : 'pushState']({ step: i }, '', '#step-' + (i + 1)); } catch (e) { /* fine */ } }
    document.title = (i === 0 ? '' : screens[i].getAttribute('data-title') + ' | ') + 'The AIOS Playbook | Chirag Shah Coaching';
    animateIn(screens[i], dir);
    var h = $('h1, h2', screens[i]); if (h && !opts.silent) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    reveal(screens[i]);
    if (opts.then) setTimeout(opts.then, motion ? 380 : 0);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]'); if (!b) return;
    e.preventDefault(); go(parseInt(b.getAttribute('data-go'), 10));
  });
  window.addEventListener('popstate', function () { go(fromHash(), { fromHistory: true }); });
  function fromHash() { var m = /^#step-(\d+)$/.exec(location.hash); return m ? parseInt(m[1], 10) - 1 : 0; }

  /* ---------- requests settle in as they scroll into view (once) ---------- */
  var io = ('IntersectionObserver' in window) && motion ? new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('rv-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  function reveal(scr) {
    $all('.rv:not(.rv-in)', scr).forEach(function (el) { if (io) io.observe(el); else el.classList.add('rv-in'); });
  }

  /* ---------- copy ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.cb-btn'); if (!btn) return;
    var text = btn.getAttribute('data-copy'), label = btn.querySelector('.roll-in');
    function shown(word) {
      label.textContent = word; label.setAttribute('data-label', word); btn.classList.add('done');
      var live = $('#sr-live'); if (live) live.textContent = word === 'Copied' ? 'Copied: ' + text : 'Selected. Press Control C to copy.';
      clearTimeout(btn._t); btn._t = setTimeout(function () { label.textContent = 'Copy'; label.setAttribute('data-label', 'Copy'); btn.classList.remove('done'); }, 1800);
    }
    function fallback() {
      var code = btn.parentElement.querySelector('code'), r = document.createRange(); r.selectNodeContents(code);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); shown('Selected');
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { shown('Copied'); }, fallback);
    else fallback();
  });

  /* ---------- button hovers: a 3D key by job (css/motion.css). The old label roll is gone. ---------- */
  var pq0 = $('#print-qr'); if (pq0) pq0.setAttribute('data-kind', 'key');

  /* ---------- first week ---------- */
  var boxes = $all('.week input');
  function update() {
    var n = boxes.filter(function (b) { return b.checked; }).length, all = boxes.length;
    $('#wk-count').textContent = n === all ? 'All ' + all + ' done. AIOS is part of your week now.' : n + ' of ' + all + ' done';
    $('#wk-bar').style.setProperty('--p', n / all);
  }
  boxes.forEach(function (b) {
    if (b.disabled) return;
    if (store('aios-pb-' + b.id) === '1') b.checked = true;
    b.addEventListener('change', function () { store('aios-pb-' + b.id, b.checked ? '1' : '0'); update(); });
  });
  update();

  /* ---------- printing: every step, or the desk card alone ---------- */
  var card = /[?&]print=card/.test(location.search);
  if (card) document.body.classList.add('print-qr');
  window.addEventListener('beforeprint', function () { $all('details').forEach(function (d) { d._was = d.open; d.open = true; }); });
  window.addEventListener('afterprint', function () {
    $all('details').forEach(function (d) { d.open = !!d._was; });
    if (!card) document.body.classList.remove('print-qr');
  });
  var pq = $('#print-qr');
  if (pq) pq.addEventListener('click', function () { document.body.classList.add('print-qr'); window.print(); });

  /* ---------- start: the step in the address, else the welcome step (with a way back to where you were) ---------- */
  var saved = parseInt(store(KEY) || '0', 10);
  var hadHash = /^#step-/.test(location.hash);
  go(fromHash(), { replace: true, silent: true });
  if (!hadHash && saved > 0 && saved < screens.length) {
    var p = document.createElement('p'); p.className = 'resume';
    var b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn-black'; b.setAttribute('data-go', saved); b.setAttribute('data-kind', 'go');
    b.textContent = 'Pick up where you left off: ' + screens[saved].getAttribute('data-title');
    p.appendChild(b); $('.welcome').appendChild(p);
  }
})();
