/* AIOS install guide, proposed copy (v2, 2026-11-13).
   One step per screen, remembered ticks, help on every step, a reward at each major connection,
   a "Larger text" view for screen sharing, and an optional walkthrough video (js/config.js).
   Motion follows the CSC Motion Kit (vault: Knowledge/Review Library/Teardowns/Award Sites 2026-11-13):
   one house curve, masked text reveals, staggered arrivals, directional step changes. Plain CSS and
   JavaScript: no libraries, no build step, nothing downloaded at run time. */
(function () {
  'use strict';

  var PARTS = window.AIOS_PARTS, JOBS = window.AIOS_JOBS || {}, BEFORE = window.AIOS_BEFORE, AFTER = window.AIOS_AFTER || [];
  var CFG = window.AIOS_CONFIG || {};
  var VID = CFG.video || {};
  var HAS_VIDEO = !!(VID.src && String(VID.src).trim());
  var KEY = 'aios-guide-proposed-v3';   /* v3: Kareem's four parts (2026-11-17); old ticks belonged to other steps */
  var TOTAL = PARTS.reduce(function (n, p) { return n + p.steps.length; }, 0);
  var OS_GUESS = /Mac/i.test(navigator.platform || navigator.userAgent) ? 'Mac' : 'Windows';

  /* ---------- Screens ---------- */
  /* Kareem's order: "Before you start" (what you need), then Parts 1 to 4, then Done. */
  var screens = [{ k: 'before' }];
  PARTS.forEach(function (p) {
    screens.push({ k: 'intro', p: p });
    p.steps.forEach(function (s, i) { screens.push({ k: 'step', p: p, i: i, s: s, id: p.id + 's' + (i + 1) }); });
    screens.push({ k: 'check', p: p, id: p.id + 'c' });
  });
  screens.push({ k: 'done' });

  /* ---------- State (browser storage is optional) ---------- */
  var state = { screen: 0, ticks: {}, big: false, aware: false };
  var storageOK = true, returning = false;
  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && typeof s === 'object') {
          state.screen = Math.min(Math.max(0, s.screen | 0), screens.length - 1);
          state.ticks = s.ticks && typeof s.ticks === 'object' ? s.ticks : {};
          state.big = s.big === true;   /* the old "Room" setting is not carried over */
          state.aware = s.aware === true;
          returning = state.screen > 0 || doneCount() > 0;
        }
      }
      window.localStorage.setItem(KEY + '-probe', '1');
      window.localStorage.removeItem(KEY + '-probe');
    } catch (e) { storageOK = false; }
    /* ?present=1 turns larger text on (for a shared screen); ?present=0 turns it off. */
    var m = /[?&]present=(0|1)\b/.exec(location.search);
    if (m) state.big = m[1] === '1';
  }
  function save() {
    if (!storageOK) return;
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { storageOK = false; showStorageNote(); }
  }
  function showStorageNote() { var n = $('#storage-note'); if (n) n.hidden = storageOK; }

  /* ---------- Helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function plain(html) { var d = document.createElement('div'); d.innerHTML = html; return d.textContent; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function doneCount() { var n = 0; screens.forEach(function (s) { if (s.k === 'step' && state.ticks[s.id]) n++; }); return n; }
  function partDone(p) { return !!state.ticks[p.id + 'c']; }
  function indexOf(pred) { for (var i = 0; i < screens.length; i++) if (pred(screens[i])) return i; return -1; }
  function firstOpen() { return indexOf(function (x) { return (x.k === 'step' || x.k === 'check') && !state.ticks[x.id]; }); }
  function allDone() { return firstOpen() < 0; }
  /* Narrow windows, and short ones (a laptop at 150% zoom), get the compact layout. */
  function compact() { return window.matchMedia('(max-width: 799px), (max-height: 600px)').matches; }
  function wide() { return window.matchMedia('(min-width: 960px)').matches; }
  /* Motion is on unless the person's computer asks for reduced motion. */
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)');
  function motionOK() { return !RM.matches; }
  var CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="square"/></svg>';
  var PLAY_SVG = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg>';

  function whereLabel(sc) {
    if (sc.k === 'opener') return 'Four words first';
    if (sc.k === 'before') return 'Before you start';
    if (sc.k === 'intro') return 'Part ' + sc.p.n + ' of 4: ' + sc.p.title;
    if (sc.k === 'step') return 'Part ' + sc.p.n + ' of 4: ' + sc.p.title + ' · Step ' + (sc.i + 1) + ' of ' + sc.p.steps.length;
    if (sc.k === 'check') return 'Part ' + sc.p.n + ' of 4 · Last check';
    return 'Done';
  }

  /* ---------- Video (only when js/config.js has a video address) ---------- */
  function toSeconds(t) {
    if (typeof t === 'number') return Math.max(0, t);
    if (!t) return null;
    var parts = String(t).trim().split(':').map(Number);
    if (parts.some(isNaN)) return null;
    return parts.reduce(function (acc, n) { return acc * 60 + n; }, 0);
  }
  function clock(sec) { var m = Math.floor(sec / 60), s = Math.floor(sec % 60); return m + ':' + (s < 10 ? '0' : '') + s; }
  function videoKind(src) {
    var y = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{6,})/.exec(src);
    if (y) return { kind: 'youtube', id: y[1] };
    var v = /vimeo\.com\/(?:video\/)?(\d+)/.exec(src);
    if (v) return { kind: 'vimeo', id: v[1] };
    /* Loom: a share link (loom.com/share/<id>) or an embed link (loom.com/embed/<id>). A private video's
       link can carry ?sid=...; keep it, or the embed asks the viewer to sign in. */
    var l = /loom\.com\/(?:share|embed)\/([\w-]{8,})/.exec(src);
    if (l) { var sid = /[?&]sid=([\w-]+)/.exec(src); return { kind: 'loom', id: l[1], sid: sid ? sid[1] : '' }; }
    return { kind: 'file' };
  }
  /* The video's shape, so its box is the right size before anything loads (no jump on the page). */
  function aspect() {
    var w = +VID.width, h = +VID.height;
    return w > 0 && h > 0 ? w / h : 16 / 9;
  }
  function withStart(url, t) { return t ? url + '#t=' + t : url; }
  function playerHTML(start, autoplay, title) {
    var src = String(VID.src).trim(), k = videoKind(src), t = Math.floor(start || 0);
    if (k.kind === 'youtube') {
      return '<iframe src="https://www.youtube-nocookie.com/embed/' + esc(k.id) + '?rel=0&start=' + t + (autoplay ? '&autoplay=1' : '') + '" title="' + esc(title) + '" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>';
    }
    if (k.kind === 'vimeo') {
      return '<iframe src="https://player.vimeo.com/video/' + esc(k.id) + (autoplay ? '?autoplay=1' : '') + '#t=' + t + 's" title="' + esc(title) + '" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>';
    }
    if (k.kind === 'loom') {
      /* Loom's embed takes ?t= (seconds) to start part way in and ?autoplay=1 to start playing. */
      var q = ['hideEmbedTopBar=true', 'hide_owner=true'];
      if (k.sid) q.unshift('sid=' + k.sid);
      if (t) q.push('t=' + t);
      if (autoplay) q.push('autoplay=1');
      return '<iframe src="https://www.loom.com/embed/' + esc(k.id) + '?' + esc(q.join('&')) + '" title="' + esc(title) + '" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>';
    }
    /* A file kept next to the guide. Optional extra copies of the same video are listed first; the browser
       plays the first one it can and falls back to `src` (H.264 plays everywhere). */
    var alts = [];
    if (VID.av1) alts.push({ src: String(VID.av1).trim(), type: 'video/webm; codecs="av01.0.12M.08, opus"' });
    if (VID.hevc) alts.push({ src: String(VID.hevc).trim(), type: 'video/mp4; codecs="hvc1.1.6.L153.B0, mp4a.40.2"' });
    var sources = alts.filter(function (a) { return a.src; }).map(function (a) {
      return '<source src="' + esc(withStart(a.src, t)) + '" type="' + esc(a.type) + '">';
    }).join('') + '<source src="' + esc(withStart(src, t)) + '">';
    return '<video controls playsinline preload="metadata" data-start="' + t + '"' + (autoplay ? ' data-autoplay="1"' : '') +
      (VID.poster ? ' poster="' + esc(VID.poster) + '"' : '') + ' aria-label="' + esc(title) + '">' + sources + '</video>';
  }
  function armVideo(root) {
    /* Jump to the step's start time. Some servers cannot jump into a file part way through, so if the start
       point is not reachable yet, wait until enough has loaded, then jump. */
    $all('video[data-start]', root).forEach(function (v) {
      var start = +v.dataset.start || 0, landed = !start, played = false;
      function reachable() { for (var i = 0; i < v.seekable.length; i++) if (v.seekable.start(i) <= start && v.seekable.end(i) >= start) return true; return false; }
      var title = $('#vmodal-title'), waitNote = 'Loading this step of the video…', wasTitle = title ? title.textContent : '';
      if (!landed && v.dataset.autoplay && title) title.textContent = waitNote;
      function tryLand() {
        if (!landed && reachable()) { landed = true; try { v.currentTime = start; } catch (e) { landed = false; } if (landed && title && title.textContent === waitNote) title.textContent = wasTitle; }
        if (landed && v.dataset.autoplay && !played) { played = true; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        if (landed) { v.removeEventListener('progress', tryLand); v.removeEventListener('canplay', tryLand); }
      }
      v.addEventListener('progress', tryLand); v.addEventListener('canplay', tryLand); v.addEventListener('loadedmetadata', tryLand);
      if (v.readyState >= 1) tryLand();
      /* A server that cannot jump at all: after 4 seconds, play from the start and say where the step begins. */
      if (!landed && v.dataset.autoplay) setTimeout(function () {
        if (landed || !v.isConnected) return;
        landed = true; tryLand();
        if (title) title.textContent = 'This step begins at ' + clock(start) + ' in the video.';
      }, 4000);
    });
  }
  function stepTime(id) { return HAS_VIDEO && VID.steps ? toSeconds(VID.steps[id]) : null; }
  function watchStepButton(id) {
    var t = stepTime(id);
    if (t === null || t === undefined) return '';
    return '<p class="watch-row"><button type="button" class="btn btn-outline watch-btn" data-act="watch" data-t="' + t + '">' + PLAY_SVG + 'Watch this step</button>' +
      '<span class="watch-at">It starts at ' + clock(t) + ' in the video.</span></p>';
  }
  function watchAllSection() {
    if (!HAS_VIDEO) return '';
    return '<section class="watch-all" aria-labelledby="watch-all-h"><h2 id="watch-all-h">Watch the whole install, start to finish</h2>' +
      '<p>See every step done on a real computer' + (VID.length ? ' (' + esc(VID.length) + ')' : '') + '. Then come back here and do it yourself, one step at a time.</p>' +
      '<div class="player" style="--ar:' + aspect().toFixed(4) + '">' + playerHTML(0, false, 'The whole AIOS install, start to finish') + '</div></section>';
  }

  /* ---------- Rendering ---------- */
  function stuckList(p) {
    return p.stuck.map(function (s) {
      return '<details class="acc"><summary>' + esc(s[0]) + '</summary><div class="acc-body"><p>' + s[1] + '</p></div></details>';
    }).join('');
  }
  /* Beside every step: how you know it worked (always shown), and what to do if it did not (one click). */
  function niceUrl(t) { return t.replace('https://mcp.chiragshahcoaching.com/aios', '<span class="url">https://mcp.<wbr>chiragshahcoaching.com/<wbr>aios</span>'); }
  function helper(p, seeText, extraRows) {
    var extra = (extraRows || []).map(function (m) { return '<details class="acc"><summary>' + esc(m[0]) + '</summary><div class="acc-body">' + m[1] + '</div></details>'; }).join('');
    return '<aside class="helper" aria-label="' + (seeText ? 'How you know it worked' : 'If you are stuck') + '">' +
      (seeText ? '<div class="see"><div class="k">How you know it worked</div><p>' + niceUrl(seeText) + '</p></div>' : '') +
      '<details class="stuck" data-helper><summary>Not what you see? Stuck?</summary><div class="hb">' +
      '<p class="find">Find the line that sounds like you.</p>' + extra + stuckList(p) +
      '<p class="contact"><a href="#help">See all install help</a><br>Or email info@chiragshahcoaching.com.</p>' +
      '</div></details></aside>';
  }
  function head(numeral, label) {
    return '<div class="step-head"><div class="numeral" aria-hidden="true" data-split>' + numeral + '</div><div class="part-label" data-split>' + label + '</div></div>';
  }
  /* The extra line under YOU SHOULD SEE stays where Kareem put it: above the steps for parts 1-3
     (the intro screen), at the end for part 4 (the check screen). */
  function shouldSee(p, label, withMore) {
    return '<div class="should-see"><div class="k">' + (label || 'You should see') + '</div><p class="v">' + esc(p.shouldSee).replace(/&quot;/g, '"') + '</p>' +
      (p.shouldSeeMore && withMore ? '<p class="more">' + p.shouldSeeMore + '</p>' : '') + '</div>';
  }
  function figure(s) {
    if (!s.img) return '';
    var shut = !!s.imgCollapsed;
    return '<figure class="figure" data-fig' + (shut ? ' hidden' : '') + '><button type="button" class="zoom-in" data-act="zoom" data-src="' + s.img + '" data-alt="' + esc(s.alt) + '" aria-label="Make this picture bigger">' +
      '<img src="' + s.img + '" alt="' + esc(s.alt) + '"></button><figcaption>' + esc(s.caption) + ' <span class="zoom-hint">(click the picture to make it bigger)</span></figcaption></figure>' +
      '<button type="button" class="btn btn-outline pic-toggle" data-act="pic" aria-expanded="' + !shut + '">' + (shut ? 'Show me a picture' : 'Hide picture') + '</button>';
  }
  function plainBox(t) {
    /* Open beside the step on wider screens; one tap to open on narrow screens and at 200% zoom. */
    return t ? '<details class="plain"' + (compact() ? '' : ' open') + '><summary class="k">In plain words</summary><p>' + t + '</p></details>' : '';
  }
  function sampleBrief() {
    return '<div class="stack"><div class="brief-card sample"><span class="tag">EXAMPLE</span><div class="inner">' +
      '<div class="meta">Morning brief · Friday</div><div class="hello">Morning, Jordan.</div>' +
      '<div class="due">Three promises due, and one new lead.</div>' +
      '<div class="meta">Today</div><dl><dt>10:00</dt><dd>Showing, 22 Linden Ave. Prep: Marisol is relocating in March and needs 4 bedrooms.</dd><dt>4:00</dt><dd>Pre-listing walkthrough, 31 Prospect St.</dd></dl>' +
      '<div class="meta">What you promised</div><dl><dt class="hi">Elena</dt><dd class="hi">3 townhouse sales from her complex. Due today.</dd><dt class="hi">Elena</dt><dd class="hi">A lender intro. Due today.</dd><dt class="hi">Priya</dt><dd class="hi">3 years of tax history for her street. Due today.</dd></dl>' +
      '<div class="meta">Waiting on others</div><dl><dt>Luis</dt><dd>His sister’s intro. 4 days now.</dd></dl>' +
      '<div class="meta">New leads</div><dl><dt>Marisol</dt><dd>A reply is drafted in Gmail for you to check.</dd></dl>' +
      '</div><div class="foot">Drafts wait in Gmail for you. Nothing was sent.</div></div></div>' +
      '<p class="caption">Made-up names. Yours is built from your own email and calendar.</p>';
  }
  function copyBox(c) {
    if (!c) return '';
    return '<div class="copybox"><div class="lbl">' + esc(c.label) + '</div><div class="row"><code>' + esc(c.value) + '</code>' +
      '<button type="button" class="btn btn-black" data-act="copy" data-value="' + esc(c.value) + '">Copy</button></div>' +
      '<div class="how">To paste: press <b>Ctrl + V</b> (Mac: <b>Cmd + V</b>).</div></div>';
  }
  function jobBlock(letter, linkText) {
    var j = JOBS[letter], body;
    if (letter === 'A') {
      var tabs = Object.keys(j.tabs);
      var guess = /Mac/i.test(navigator.platform || navigator.userAgent) ? 'Mac' : 'Windows';
      body = '<div class="tabs" role="tablist">' + tabs.map(function (t) {
        return '<button type="button" role="tab" data-act="tab" data-tab="' + t + '" aria-selected="' + (t === guess) + '">' + t + '</button>';
      }).join('') + '</div>' +
        tabs.map(function (t) {
          return '<ol class="mini" data-tabpanel="' + t + '"' + (t === guess ? '' : ' hidden') + '>' + j.tabs[t].map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>';
        }).join('') +
        '<p style="margin:14px 0 6px;font-weight:600;color:var(--ink)">' + j.thenLabel + '</p>' +
        '<ol class="mini" start="5" style="counter-reset:m 4">' + j.then.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>';
    } else {
      body = '<ol class="mini">' + j.steps.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>';
    }
    return '<details class="job"><summary><span class="badge">JOB ' + letter + '</span>' + esc(linkText) + '</summary><div class="jb">' +
      '<p style="font-weight:600;color:var(--ink);margin-bottom:4px">' + esc(j.title) + '</p><p>' + esc(j.lead) + '</p>' + body + '</div></details>';
  }
  /* Windows and Mac: one tab each, the computer's own tab open first. Each tab can have its own short list and picture. */
  function osBlock(s) {
    if (!s.os) return '';
    var tabs = Object.keys(s.os);
    return '<div class="os-block st"><div class="tabs" role="tablist" aria-label="Your computer">' + tabs.map(function (t) {
      return '<button type="button" role="tab" data-act="tab" data-tab="' + t + '" aria-selected="' + (t === OS_GUESS) + '">' + t + '</button>';
    }).join('') + '</div>' + tabs.map(function (t) {
      var o = s.os[t];
      return '<div class="os-panel" data-tabpanel="' + t + '"' + (t === OS_GUESS ? '' : ' hidden') + '>' +
        (o.steps ? '<ol class="mini">' + o.steps.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>' : '') +
        (o.img ? '<figure class="figure"><button type="button" class="zoom-in" data-act="zoom" data-src="' + o.img + '" data-alt="' + esc(o.alt) + '" aria-label="Make this picture bigger"><img src="' + o.img + '" alt="' + esc(o.alt) + '"></button><figcaption>' + esc(o.alt) + '</figcaption></figure>' : '') +
        '</div>';
    }).join('') + '</div>';
  }
  function tickButton(label, ticked) {
    return '<button type="button" class="btn btn-mint tick-btn' + (ticked ? ' is-ticked' : '') + '" data-act="tick"><span class="tk">' + CHECK_SVG + '</span>' + label + '</button>';
  }
  function term(name, text, like) {
    return '<div class="term"><h2>' + name + '</h2><p>' + text + '</p><p class="like"><b>Think of it this way:</b> ' + like + '</p></div>';
  }

  function renderScreen(sc) {
    var html = '', side = false;
    if (sc.k === 'opener') {
      html = '<div class="opener">' +
        '<h1 data-split>Four words in plain English.</h1>' +
        '<p class="lead">This takes about two minutes. You do not need to remember any of it.</p>' +
        '<p class="claude-is"><b>Claude is the whole app you type into.</b> The model is the engine inside it. The harness is the rest of the car around the engine.</p>' +
        '<div class="terms">' +
        term('The model', 'The model is the engine: the part that reads what you type and writes back. It learned from a huge amount of writing. It does not think like a person. It makes its best guess at a helpful answer, so you still check its work.', 'Like the engine in a car.') +
        term('The harness', 'The harness is everything built around the model so it can do real work for you: the Claude app’s buttons, its links to your email and calendar if you turn them on, and the boxes that can ask your permission first. AIOS plugs into the harness.', 'Like the rest of the car around the engine: the wheel, the brakes, the seat belts.') +
        term('Context', 'Context is what Claude can see while it works on your request: your message, your AIOS Project, and what it reads from your email or calendar once you allow it. If it cannot see it, it cannot use it.', 'Like the papers on a desk in front of it.') +
        term('Memory', 'Memory is what gets saved so you do not have to explain yourself again. AIOS keeps notes about your work, like the promises you confirm, in your AIOS folder on your computer. Next time, it reads them back.', 'Like a notebook it keeps on your computer.') +
        '</div>' +
        '<p class="relax">Today you connect AIOS to the Claude app. That lets it see your email, your calendar and your AIOS folder. Each step tells you what to click and what you should see.</p>' +
        '<div class="actions">' + '<button type="button" class="btn btn-mint" data-act="next">Got it. Next</button>' +
        '<button type="button" class="btn btn-quiet" data-act="back">Back</button>' + '</div>' +
        '</div>';
    } else if (sc.k === 'before') {
      /* Kareem's "Before you start" layout: the words on the left, the five things as a checklist on the right. */
      var nHave = BEFORE.items.filter(function (it, i) { return state.ticks['b' + i]; }).length;
      html = '<div class="before"><div class="before-grid"><div class="before-copy">' +
        '<h1 data-split>Before you start</h1>' +
        '<p class="lead" style="font-weight:600;color:var(--ink)">Check you have these five things. Then you install AIOS in four parts.</p>' +
        '<p>Do this on your <b>Windows or Mac computer</b>, not a phone or tablet. Keep this page open beside the Claude app.</p>' +
        '<p class="flag">Used the old AIOS or Prospecting OS? Follow every step. Your upgrade step is in Part 4.</p>' +
        '<p class="time"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>' +
        '<span>' + (CFG.installTime ? '<b>Set aside ' + esc(CFG.installTime) + '.</b> ' : '') + 'You can stop at any time. This page remembers your ticks, on this computer and in this browser.</span></p>' +
        '</div><div class="have st"><h2>What you need</h2><ol>' + BEFORE.items.map(function (it, i) {
          var on = !!state.ticks['b' + i];
          return '<li><span class="n" aria-hidden="true">' + (i + 1) + '</span><div><b>' + esc(it[0]) + '</b><span>' + esc(it[1]) + '</span></div>' +
            '<button type="button" class="have-box' + (on ? ' is-on' : '') + '" data-act="btick" data-i="' + i + '" aria-pressed="' + on + '" aria-label="I have this: ' + esc(it[0]) + '">' + CHECK_SVG + '</button></li>';
        }).join('') + '</ol></div></div>' +
        '<div class="missing st"><h3>If you don’t have one</h3>' +
        BEFORE.missing.map(function (m) { return '<details class="acc"><summary>' + esc(m[0]) + '</summary><div class="acc-body">' + m[1] + '</div></details>'; }).join('') + '</div>' +
        watchAllSection() +
        '<div class="actions"><button type="button" class="btn btn-mint" data-act="next">' + (nHave === 5 ? 'I have all five. Start Part 1' : 'I have everything. Start Part 1') + '</button>' +
        '<a class="btn btn-quiet" href="#help-before">Missing something? Get help</a></div>' +
        '<div class="ahead st"><h2>What you will see at the end of each part</h2>' +
        '<ol class="preview">' + PARTS.map(function (p) { return '<li class="' + (partDone(p) ? 'is-done' : '') + '"><span><b>Part ' + p.n + ', ' + esc(p.title) + '.</b> ' + esc(p.shouldSee) + '</span></li>'; }).join('') + '</ol></div>' +
        '</div>';
    } else if (sc.k === 'intro') {
      var p = sc.p;
      var firstOpen = p.steps.findIndex(function (s, i) { return !state.ticks[p.id + 's' + (i + 1)]; });
      var startLabel = firstOpen > 0 ? 'Keep going: step ' + (firstOpen + 1) : 'Start Part ' + p.n;
      html = '<div class="part-intro">' + head(p.n, 'Part ' + p.n + ' of 4') +
        '<h1 data-split>' + esc(p.title) + '</h1>' +
        (p.goal ? '<p class="goal"><b>Goal:</b> ' + esc(p.goal) + '</p>' : '') +
        (p.headsUp ? '<p class="flag">' + p.headsUp + '</p>' : '') +
        '<div style="margin-top:20px">' + shouldSee(p, 'When Part ' + p.n + ' is done you will see', true) + '</div>' +
        '<div class="actions"><button type="button" class="btn btn-mint" data-act="start">' + startLabel + '</button>' +
        '<button type="button" class="btn btn-quiet" data-act="back">Back</button></div>' +
        (p.listLabel ? '<p class="part-label" style="margin-top:28px">' + esc(p.listLabel) + '</p>' : '<p style="margin:28px 0 0;font-weight:600;color:var(--ink)">' + p.steps.length + ' steps, one at a time:</p>') +
        '<ol class="preview">' + p.steps.map(function (s, i) { return '<li class="' + (state.ticks[p.id + 's' + (i + 1)] ? 'is-done' : '') + '">' + esc(plain(s.title ? s.title + ' ' + s.text : s.text)) + '</li>'; }).join('') + '</ol></div>';
    } else if (sc.k === 'step') {
      var s = sc.s, P = sc.p, ticked = !!state.ticks[sc.id];
      side = true;
      html = '<div class="step-card">' + head(sc.i + 1, 'Part ' + P.n + ' of 4 · Step ' + (sc.i + 1) + ' of ' + P.steps.length + (s.group ? ' · ' + esc(s.group) : '')) +
        /* Part 3 moves between three places: say which one, every time (Kareem's "Each step tells you when the place changes"). */
        (s.place ? '<p class="place"><span class="place-dot" aria-hidden="true"></span>' + esc(s.place) + '</p>' : '') +
        (s.title ? '<h1 class="step-title" data-split>' + esc(s.title) + '</h1><p class="step-text">' + s.text + '</p>' : '<h1 class="step-text" data-split>' + s.text + '</h1>') +
        (s.note ? '<p class="step-note">' + esc(s.note) + '</p>' : '') +
        (s.noteHtml ? '<p class="step-note">' + s.noteHtml + '</p>' : '') +
        watchStepButton(sc.id) +
        plainBox(s.plain) +
        osBlock(s) +
        figure(s) +
        (s.noteAfter ? '<p class="step-note" style="margin-top:12px">' + esc(s.noteAfter) + '</p>' : '') +
        copyBox(s.copy) +
        (s.upgrade ? '<p class="flag" style="margin-top:16px">' + s.upgrade + '</p>' : '') +
        (s.job ? jobBlock(s.job, s.jobLink) : '') +
        '<div class="actions">' + tickButton(ticked ? 'Ticked. Next step' : 'Done. Next step', ticked) +
        '<button type="button" class="btn btn-quiet" data-act="back">Back</button>' +
        (ticked ? '<button type="button" class="btn btn-quiet untick" data-act="untick">Untick this step</button>' : '') +
        '</div>' +
        '</div>' + helper(P, s.see, sc.id === 'p2s1' ? [BEFORE.missing[0]] : null);
    } else if (sc.k === 'check') {
      var c = sc.p, cticked = !!state.ticks[sc.id];
      side = true;
      html = '<div class="step-card">' + head(c.n, 'Part ' + c.n + ' of 4 · Last check') +
        '<h1 class="step-text" data-split>Do you see this on your screen?</h1>' + shouldSee(c, null, c.n === 4) +
        (c.headsUp ? '<p class="step-note" style="margin-top:18px">' + c.headsUp + '</p>' : '') +
        (c.extras ? '<p class="step-note" style="margin-top:18px">' + esc(c.extras) + '</p>' : '') +
        watchStepButton(sc.id) +
        '<div class="actions">' + tickButton(c.button, cticked) +
        '<button type="button" class="btn btn-quiet" data-act="back">Back</button>' +
        '<button type="button" class="btn btn-quiet" data-act="backpart">' + esc(c.backLabel) + '</button></div></div>' +
        helper(c, null);
    } else if (sc.k === 'done') {
      var finished = allDone() || state.aware, n = doneCount();
      if (!finished) {
        /* Not every step is ticked: claim nothing. The count, one way back, and (Maxx, 2026-11-17) a way through for
           someone who knows it is installed and simply did not tick as they went. */
        html = '<div class="done not-finished">' +
          '<h1 data-split>Almost there.</h1>' +
          '<div class="not-yet" role="status"><p><b>You have not ticked every step yet:</b> ' + n + ' of ' + TOTAL + ' steps done.</p>' +
          '<div class="not-yet-actions"><button type="button" class="btn btn-black" data-act="firstopen">Go to the first step I have not ticked</button>' +
          '<button type="button" class="btn btn-outline" data-act="openall">Show me every step</button></div></div>' +
          '<div class="aware st"><p class="aware-k">Already installed?</p>' +
          '<p>If AIOS said hello and named your four agents, it is installed, ticks or not.</p>' +
          '<button type="button" class="btn btn-mint" data-act="aware">I’m aware. Everything is installed. Proceed</button></div>' +
          '<p style="margin-top:18px">Need help? Visit <a href="#help">Get help</a>.</p>' +
          '<div class="actions" style="justify-content:center"><button type="button" class="btn btn-quiet" data-act="back">Back</button></div></div>';
      } else
      html = '<div class="done">' +
        '<div class="done-mark">' + CHECK_SVG.replace('<svg ', '<svg width="48" height="48" ') + '</div>' +
        '<h1 data-split>You’re set up.</h1>' +
        '<p style="font-size:var(--fs-lead);margin-top:12px">AIOS is connected to Claude. <b>AIOS takes it from here, in the chat.</b></p>' +
        '<div class="after-grid">' + AFTER.map(function (a) { return '<div class="after-card"><h2>' + esc(a[0]) + '</h2><p>' + a[1] + '</p></div>'; }).join('') + '</div>' +
        '<div class="next-card"><div class="part-label">First thing to try</div><p style="font-weight:600;color:var(--ink);font-size:21px;margin:6px 0 12px">When setup is done, type this in your AIOS Project.</p>' +
        copyBox({ label: 'Type this', value: 'What do I owe?' }) + '</div>' +
        /* One unmistakable final check, built from Kareem's own end-of-part lines. */
        '<section class="worked" aria-labelledby="worked-h"><h2 id="worked-h">How to know it worked</h2>' +
        '<p>Your install worked if you have seen all four of these:</p><ol class="worked-list">' +
        PARTS.map(function (p, i) {
          var ok = partDone(p) || state.aware;   /* "I'm aware": they told us it is installed; we don't argue */
          return '<li class="' + (ok ? 'ok' : 'open') + '" style="--d:' + (500 + i * 160) + 'ms"><span class="ck">' + (ok ? CHECK_SVG : '') + '</span><span><b>Part ' + p.n + '.</b> ' + esc(p.shouldSee) +
            (ok ? '' : ' <span class="not-ticked">(not ticked yet)</span>') + '</span></li>';
        }).join('') + '</ol>' +
        '<p class="worked-no">One of them is missing? Go back to that part with the numbers at the top of this page, or visit <a href="#help">Get help</a>.</p></section>' +
        '<div class="next-card"><div class="part-label">Your first Morning Brief</div><p style="margin:6px 0 0">It will look something like this, built from your own email and calendar.</p></div>' +
        '<div style="text-align:left;margin-bottom:18px">' + sampleBrief() + '</div>' +
        '<div class="next-card next-pb"><div class="part-label">Next</div><p style="font-weight:600;color:var(--ink);font-size:21px;margin:6px 0 12px">See what to type for each of your four agents.</p><a class="btn btn-mint" href="playbook.html">Open The Playbook</a></div>' +
        /* The Meeting OS update (2026-11-14): shown only when js/config.js has its address. */
        (CFG.meetingOsGuide ? '<div class="next-card"><div class="part-label">New: the Meeting OS update</div><p style="font-weight:600;color:var(--ink);font-size:21px;margin:6px 0">Turn every client meeting into a plan you can see.</p><p style="margin:0 0 12px">Set up Granola, connect it to Claude and turn on Meeting OS.</p><a class="btn btn-black" href="' + esc(CFG.meetingOsGuide) + '">Open the Meeting OS guide</a></div>' : '') +
        '<div class="remember"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg><p style="margin:0"><b>One thing to remember.</b> Leave your computer on with Claude open, so your briefs can run.</p></div>' +
        '<p style="margin-top:18px">Need help? Visit <a href="#help">Get help</a>.</p>' +
        '<div class="actions" style="justify-content:center"><button type="button" class="btn btn-quiet" data-act="back">Back</button></div></div>';
    }
    return '<div class="screen' + (side ? ' has-side' : '') + '">' + html + '</div>';
  }

  /* ---------- Motion ---------- */
  /* Masked text: each word sits in a clipping box and rises into view (or drops, when going back).
     Words are grouped at whitespace, so "Click <b>+ Add</b>," keeps its comma with its word.
     The text itself is never changed: only wrapped. */
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
    el.textContent = '';
    el.appendChild(frag);
  }
  /* Give each word a delay by the line it sits on (0.05 s per line, measured on Spyker). */
  function lineDelays(el, base) {
    var tops = [], words = $all('.wm', el);
    words.forEach(function (w) { var t = Math.round(w.offsetTop); if (tops.indexOf(t) < 0) tops.push(t); });
    tops.sort(function (a, b) { return a - b; });
    words.forEach(function (w) { w.firstChild.style.setProperty('--d', (base + tops.indexOf(Math.round(w.offsetTop)) * 50) + 'ms'); });
  }
  /* The parts of a screen arrive one after another: 80 ms apart (measured on Spyker), never more than
     400 ms in total, so the button is always there within about half a second. */
  function stagger(scr) {
    var items = [];
    var card = $('.step-card', scr);
    var host = card || $('.opener, .before, .part-intro, .done', scr);
    if (host) Array.prototype.slice.call(host.children).forEach(function (c) { if (!c.matches('[data-split], .step-head, .done-mark')) items.push(c); });
    var aside = $('.helper', scr); if (aside) items.push(aside);
    items.forEach(function (it, i) { it.classList.add('st'); it.style.setProperty('--d', Math.min(i * 80, 400) + 'ms'); });
  }
  var cleanTimer;
  function animateIn(scr, dir) {
    $all('[data-split]', scr).forEach(function (el) { split(el); });
    stagger(scr);
    scr.classList.add(dir === 'back' ? 'in-back' : 'in-fwd');
    $all('[data-split]', scr).forEach(function (el, i) { lineDelays(el, el.classList.contains('numeral') ? 0 : 40); });
    clearTimeout(cleanTimer);
    cleanTimer = setTimeout(function () { scr.classList.remove('in-fwd', 'in-back'); }, 1400);
  }
  /* The screen you are leaving slides away and fades in a fifth of a second; it never takes clicks. */
  function ghost(old, dir) {
    var layer = $('#ghost');
    layer.innerHTML = '';
    old.classList.remove('in-fwd', 'in-back');
    old.classList.add(dir === 'back' ? 'out-back' : 'out-fwd');
    layer.appendChild(old);
    var done = function () { if (old.parentNode === layer) layer.removeChild(old); };
    old.addEventListener('animationend', function (e) { if (e.target === old) done(); });
    setTimeout(done, 400);
  }

  /* Button hovers say what the button does (Maxx, 2026-11-17: the old label roll swapped a word for the same word).
     The shared styles live in css/motion.css; this only tags each button with its job:
     - go:   moves you forward (Next, Start, Install, Open). A 3D key that lifts toward you; its arrow leads the way.
     - back: moves you back. The mirror of go, toward the left.
     - tick: marks a step done. The box shows the check before you commit.
     - key:  does something on the spot (Copy, Show me a picture). Lifts straight up and presses down like a key. */
  function kindOf(b) {
    var a = b.dataset.act, href = b.getAttribute('href') || '';
    if (a === 'tick') return 'tick';
    if (a === 'back' || a === 'backpart' || a === 'firstopen') return 'back';
    if (a === 'copy' || a === 'pic' || a === 'zoom' || a === 'openall' || /^mailto:/.test(href)) return 'key';
    return 'go';
  }
  var ARROW = '<span class="arw" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M2 8h11M9 4l4 4-4 4"/></svg></span>';
  function rollify(root) {
    $all('.btn', root).forEach(function (b) {
      if (b.dataset.kind) return;
      var k = kindOf(b); b.dataset.kind = k;
      if (b.querySelector('svg') || b.closest('.site-header')) return;
      if (k === 'back') b.insertAdjacentHTML('afterbegin', ARROW);
      else if (k === 'go' && !b.classList.contains('btn-quiet')) b.insertAdjacentHTML('beforeend', ARROW);
    });
  }
  function setLabel(b, text) {
    var t = Array.prototype.slice.call(b.childNodes).filter(function (n) { return n.nodeType === 3 && n.nodeValue.trim(); })[0];
    if (t) t.nodeValue = text; else b.insertBefore(document.createTextNode(text), b.firstChild);
  }

  /* ---------- Render ---------- */
  var welcomeShown = false, prevCount = null, prevParts = null;

  function render(opts) {
    opts = opts || {};
    var root = $('#screen');
    var dir = opts.dir && motionOK() ? opts.dir : null;
    var old = root.firstElementChild;
    if (dir && old && opts.ghost) { root.removeChild(old); ghost(old, dir); } else $('#ghost').innerHTML = '';
    root.innerHTML = renderScreen(screens[state.screen]);
    var scr = root.firstElementChild;
    rollify(scr);
    var h = $('[data-helper]', root);
    if (h && !state.big && wide()) h.open = true;
    if (dir) animateIn(scr, dir);
    if (screens[state.screen].k === 'done' && opts.celebrate && allDone()) celebrate(scr);
    armVideo(scr);
    renderProgress();
    renderWelcome();
    renderReward();
    if (opts.focus) {
      toStep();
      root.focus({ preventScroll: true });
    }
    {
      var t0 = Date.now();
      fitToScreen(scr);
      /* a picture that is still loading changes the height: check again when it arrives, unless the person has already clicked */
      $all('.figure img', scr).forEach(function (im) { if (!im.complete) im.addEventListener('load', function () { if (Date.now() - t0 < 4000 && scr.isConnected && !scr.dataset.touched) fitToScreen(scr); }, { once: true }); });
      scr.addEventListener('click', function () { scr.dataset.touched = '1'; }, { once: true });
    }
  }
  /* Laptop screens: the instruction and its button should be on screen when a step opens. If the button
     would be below the bottom edge, close "In plain words" (one click to open), then fold the picture behind
     "Show me a picture", which is how Kareem's original shows every picture. */
  function fitToScreen(scr) {
    var btn = $('[data-act="tick"]', scr);
    if (!btn) return;
    function overBy() { return btn.getBoundingClientRect().bottom - (window.innerHeight - 8); }
    var fig = $('[data-fig]:not([hidden])', scr), tog = $('[data-act="pic"]', scr), img = fig && $('img', fig);
    /* 1. a smaller picture (never under 150px tall; it can still be clicked to make it bigger) */
    function shrink() { if (!img || !img.complete || !img.naturalHeight) return; var o = overBy(); if (o <= 0) return; var h = img.getBoundingClientRect().height; if (h - o >= 150) img.style.maxHeight = Math.floor(h - o) + 'px'; }
    shrink();
    /* 2. close "In plain words" (one click to open again) */
    var pl = $('.plain[open]', scr);
    if (overBy() > 0 && pl) { pl.open = false; }
    shrink();
    /* 3. last resort: the picture waits behind "Show me a picture" */
    if (overBy() > 0 && fig && tog) { fig.hidden = true; tog.setAttribute('aria-expanded', 'false'); setLabel(tog, 'Show me a picture'); }
  }
  /* Narrow screens and 200% zoom: bring the step card itself to the top, so the instruction and the
     button are on screen without scrolling. Wider screens: scroll back to the progress strip if needed. */
  function toStep() {
    var first = [$('#welcome'), $('#reward'), $('#screen')].filter(function (el) { return !el.hidden; })[0];
    if (compact()) { var r = first.getBoundingClientRect(); window.scrollTo(0, r.top + window.pageYOffset - 8); return; }
    /* Wide screens: the menu scrolls away and the "You are here" strip sits at the top, so the step gets the room. */
    var view = $('#view-install');
    window.scrollTo(0, view.getBoundingClientRect().top + window.pageYOffset);
  }

  function renderProgress() {
    var sc = screens[state.screen];
    var n = doneCount();
    $('#here-where').textContent = whereLabel(sc);
    var cnt = $('#here-count');
    /* Only rebuilt when the number changes, so the little roll of the number is not cut short. */
    if (n !== prevCount || !cnt.querySelector('.num')) {
      cnt.innerHTML = '<span class="num-m"><span class="num">' + n + '</span></span> of ' + TOTAL + ' steps done';
      if (prevCount !== null && n > prevCount && motionOK()) cnt.querySelector('.num').classList.add('bump');
    }
    prevCount = n;
    var bar = $('#bar'); bar.setAttribute('aria-valuenow', n);
    $('#bar i').style.setProperty('--p', n / TOTAL);

    var curPart = sc.p ? sc.p.n : (sc.k === 'done' ? 5 : 0);
    var doneNow = PARTS.map(partDone);
    var sig = curPart + ':' + doneNow.join(',') + ':' + allDone();
    if (sig !== renderProgress.sig) { renderProgress.sig = sig; $('#parts').innerHTML = '<li><button type="button" data-jump="before" class="prep"' + (curPart === 0 ? ' aria-current="step"' : '') + '><span class="box"></span><span class="label">Before you start</span></button></li>' + PARTS.map(function (p, i) {
      var popped = prevParts && doneNow[i] && !prevParts[i] && motionOK();
      return '<li><button type="button" data-jump="' + p.id + '" class="' + (partDone(p) ? 'done' : '') + (popped ? ' pop' : '') + '"' + (curPart === p.n ? ' aria-current="step"' : '') + '>' +
        '<span class="box">' + (partDone(p) ? CHECK_SVG.replace('<svg ', '<svg width="16" height="16" ') : p.n) + '</span><span class="label">' + esc(p.title) + '</span></button></li>';
    }).join('') + '<li><button type="button" data-jump="done" class="' + (allDone() ? 'done' : '') + '"' + (curPart === 5 ? ' aria-current="step"' : '') + '><span class="box">' + (allDone() ? CHECK_SVG.replace('<svg ', '<svg width="16" height="16" ') : '') + '</span><span class="label">Done</span></button></li>'; }
    prevParts = doneNow;

    /* The "All steps" panel: the box ticks (and stays put); the words take you to the step. */
    var row = 0;
    $('#all-steps-list').innerHTML = PARTS.map(function (p) {
      return '<div class="as-part"><h3><span class="as-n">' + p.n + '</span>' + esc(p.title) + '</h3><ol>' + p.steps.map(function (s, i) {
        var id = p.id + 's' + (i + 1), idx = indexOf(function (x) { return x.id === id; }), on = !!state.ticks[id], here = idx === state.screen;
        return '<li class="' + (on ? 'is-done ' : '') + (here ? 'is-here' : '') + '" style="--i:' + (row++) + '">' +
          '<button type="button" class="as-box" data-tickid="' + id + '" aria-pressed="' + on + '" aria-label="' + (on ? 'Untick' : 'Tick') + ' step ' + (i + 1) + ' of part ' + p.n + '">' + CHECK_SVG.replace('<svg ', '<svg width="14" height="14" ') + '</button>' +
          '<button type="button" class="as-go" data-goto="' + idx + '"' + (here ? ' aria-current="step"' : '') + '><span class="as-i">' + (i + 1) + '</span>' + esc(plain(s.text)) + '</button></li>';
      }).join('') + '</ol></div>';
    }).join('');
    var asc = $('#as-count'); if (asc) asc.textContent = n + ' of ' + TOTAL + ' steps ticked';
    var asb = $('#as-bar'); if (asb) asb.style.setProperty('--p', n / TOTAL);
    var pill = $('#steps-pill-n'); if (pill) pill.textContent = n + ' of ' + TOTAL;
    var pb = $('#steps-pill'); if (pb) pb.style.setProperty('--p', n / TOTAL);

    $all('[data-big]').forEach(function (b) { b.setAttribute('aria-pressed', String(state.big)); });
  }

  /* Coming back later: say where they stopped, once, on the first screen they see. */
  function renderWelcome() {
    var w = $('#welcome');
    if (!returning || welcomeShown) { w.hidden = true; return; }
    /* One line: the "You are here" strip above already says which step this is. */
    w.innerHTML = '<p><b>Welcome back.</b> ' + (doneCount() > 0 ? 'Your ticks are saved. ' : '') + 'Carry on below from where you stopped.</p>';
    w.hidden = false;
  }
  function renderResume() {
    var r = $('#resume'), n = doneCount();
    if (!(state.screen > 0 || n > 0) || state.screen === screens.length - 1) { r.hidden = true; return; }
    $('#resume-text').innerHTML = '<b>You have started installing AIOS.</b> ' + n + ' of ' + TOTAL + ' steps ticked. Next: ' + esc(whereLabel(screens[state.screen])) + '.';
    r.hidden = false;
  }

  /* ---------- Navigation ---------- */
  var lastNav = 0, busy = false;
  function go(i, dir, extra) {
    extra = extra || {};
    var target = Math.min(Math.max(0, i), screens.length - 1);
    if (!dir) dir = target >= state.screen ? 'fwd' : 'back';
    state.screen = target;
    welcomeShown = true;
    lastNav = Date.now();
    toggleAll(false); /* any move closes the "See all steps" panel */
    save();
    if (!extra.fromHistory) { try { history.pushState(null, '', '#install/' + target); } catch (e) { /* history blocked: the page still works */ } }
    render({ dir: dir, ghost: true, focus: true, celebrate: extra.celebrate });
  }
  function tick(btn) {
    var sc = screens[state.screen];
    if (!sc.id || busy) return;
    var was = !!state.ticks[sc.id];
    state.ticks[sc.id] = true;
    save();
    var final = sc.k === 'check' && sc.p.n === 4;
    var msg = sc.k === 'check' ? 'Part ' + sc.p.n + ' done. ' + sc.p.reward : (sc.s && sc.s.reward);
    function finish() {
      busy = false;
      if (final && !was) { announce(sc.p.reward); go(state.screen + 1, 'fwd', { celebrate: true }); return; }
      if (msg && !was) reward(msg); else announce('Ticked.');
      go(state.screen + 1, 'fwd');
    }
    if (was || !motionOK()) { finish(); return; }
    /* The tick: the box fills and the check draws (0.34 s), the bar fills, then the next step slides in. */
    busy = true;
    btn.classList.add('ticking');
    renderProgress();
    setTimeout(finish, 340);
  }
  function back() { go(state.screen - 1, 'back'); }

  /* ---------- Rewards (major connections only; never block a click) ---------- */
  /* The reward is shown in its own line above the next step (never over it), and stays until the next move. */
  var pendingReward = null;
  function reward(msg) { pendingReward = msg; announce(msg); }
  function renderReward() {
    var el = $('#reward');
    if (!pendingReward) { el.hidden = true; el.classList.remove('play'); return; }
    $('#reward-msg').textContent = pendingReward;
    pendingReward = null;
    el.hidden = false;
    el.classList.remove('play'); void el.offsetWidth; el.classList.add('play');
  }
  /* The very end: a bigger moment on the Done screen itself. */
  var CONFETTI = [[-150, -90, -35], [140, -110, 40], [-190, 10, 20], [185, 30, -30], [-80, -150, 60], [90, -160, -50], [-120, 90, 45],
    [130, 95, -45], [-30, -175, 15], [40, -190, -20], [-200, -60, 70], [210, -50, -65], [-60, 120, 30], [70, 130, -25], [0, -205, 90], [-165, 70, -10], [170, 75, 15], [15, 150, 50]];
  function celebrate(scr) {
    if (!motionOK()) return;
    var mark = $('.done-mark', scr);
    mark.classList.add('celebrate');
    mark.insertAdjacentHTML('beforeend', '<span class="ring"></span><span class="ring r2"></span>' + CONFETTI.map(function (c, i) {
      return '<span class="cf" style="--dx:' + c[0] + 'px;--dy:' + c[1] + 'px;--r:' + c[2] + 'deg;--d:' + (120 + (i % 6) * 25) + 'ms"></span>';
    }).join(''));
    setTimeout(function () { $all('.cf, .ring', mark).forEach(function (x) { x.remove(); }); }, 1700);
  }
  function announce(t) { var a = $('#announce'); a.textContent = ''; setTimeout(function () { a.textContent = t; }, 30); }

  /* ---------- Events ---------- */
  var NAV_ACTS = { tick: 1, next: 1, start: 1, back: 1, backpart: 1, firstopen: 1 };
  $('#screen').addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    var act = b.dataset.act, sc = screens[state.screen];
    /* A double-click must never tick two steps: moving buttons ignore clicks for half a second after a move. */
    if (NAV_ACTS[act] && (busy || Date.now() - lastNav < 500)) return;
    if (act === 'tick') tick(b);
    else if (act === 'next') go(state.screen + 1, 'fwd');
    else if (act === 'start') {
      var p = sc.p, k = p.steps.findIndex(function (s, i) { return !state.ticks[p.id + 's' + (i + 1)]; });
      go(state.screen + 1 + (k > 0 ? k : 0), 'fwd');
    }
    else if (act === 'back') back();
    else if (act === 'firstopen') { var f = firstOpen(); if (f >= 0) go(f, 'back'); }
    else if (act === 'aware') { state.aware = true; save(); announce('Done. Everything is installed.'); render({ dir: 'fwd', ghost: true, focus: true, celebrate: true }); }
    else if (act === 'openall') toggleAll(true);
    else if (act === 'btick') {
      var bi = 'b' + b.dataset.i, onb = !state.ticks[bi];
      if (onb) state.ticks[bi] = true; else delete state.ticks[bi];
      save(); b.classList.toggle('is-on', onb); b.setAttribute('aria-pressed', String(onb));
      if (onb && motionOK()) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
      var nh = BEFORE.items.filter(function (it, i) { return state.ticks['b' + i]; }).length, nb = $('[data-act="next"]', $('#screen'));
      if (nb) setLabel(nb, nh === 5 ? 'I have all five. Start Part 1' : 'I have everything. Start Part 1');
    }
    else if (act === 'backpart') {
      var prev = PARTS[sc.p.n - 2];
      go(prev ? indexOf(function (x) { return x.k === 'intro' && x.p === prev; }) : 0, 'back');
    }
    else if (act === 'untick') { delete state.ticks[sc.id]; save(); render({}); announce('Unticked.'); }
    else if (act === 'pic') {
      var fig = b.previousElementSibling, open = b.getAttribute('aria-expanded') === 'true';
      fig.hidden = open; b.setAttribute('aria-expanded', String(!open)); setLabel(b, open ? 'Show me a picture' : 'Hide picture');
    }
    else if (act === 'zoom') openZoom(b);
    else if (act === 'copy') copy(b);
    else if (act === 'watch') openVideo(+b.dataset.t || 0, b);
    else if (act === 'tab') {
      var box = b.closest('.jb, .os-block');
      $all('[role="tab"]', box).forEach(function (t) { t.setAttribute('aria-selected', String(t === b)); });
      $all('[data-tabpanel]', box).forEach(function (pnl) { pnl.hidden = pnl.dataset.tabpanel !== b.dataset.tab; });
    }
  });

  function copy(b) {
    var v = b.dataset.value, ok = function () { setLabel(b, 'Copied'); b.classList.add('copied'); setTimeout(function () { setLabel(b, 'Copy'); b.classList.remove('copied'); }, 1600); };
    try {
      if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(v).then(ok, fallback); return; }
    } catch (e) { /* fall through */ }
    fallback();
    function fallback() {
      try {
        var ta = document.createElement('textarea'); ta.value = v; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); ok();
      } catch (e) { setLabel(b, 'Select and copy it'); }
    }
  }

  $('#parts').addEventListener('click', function (e) {
    var b = e.target.closest('[data-jump]'); if (!b) return;
    var j = b.dataset.jump;
    go(j === 'done' ? screens.length - 1 : j === 'before' ? 0 : indexOf(function (x) { return x.k === 'intro' && x.p.id === j; }));
  });
  $('#all-steps-list').addEventListener('click', function (e) {
    var box = e.target.closest('[data-tickid]');
    if (box) {
      /* Ticking from the panel: the box changes, nothing moves. */
      var id = box.dataset.tickid, on = !state.ticks[id];
      if (on) state.ticks[id] = true; else delete state.ticks[id];
      save(); renderProgress(); announce(on ? 'Ticked.' : 'Unticked.');
      var again = $('[data-tickid="' + id + '"]'); if (again) { if (e.detail === 0) again.focus(); if (on && motionOK()) again.classList.add('pop'); }
      if (screens[state.screen].id === id) render({});
      return;
    }
    var b = e.target.closest('[data-goto]'); if (!b) return;
    toggleAll(false); go(+b.dataset.goto);
  });
  /* The panel slides in from the right over the page (it never pushes the step down), and can be read through. */
  var allReturn = null;
  function toggleAll(force) {
    var panel = $('#all-steps'), btn = $('#toggle-all');
    if (!panel) return;
    var open = typeof force === 'boolean' ? force : !panel.classList.contains('is-open');
    if (open === panel.classList.contains('is-open')) return;
    panel.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('as-open', open);
    if (open) { panel.removeAttribute('inert'); allReturn = document.activeElement; setTimeout(function () { var h = $('.is-here .as-go', panel) || $('#as-close'); if (h) { h.focus({ preventScroll: true }); h.scrollIntoView({ block: 'center' }); } }, 60); }
    else { panel.setAttribute('inert', ''); if (allReturn && allReturn.focus && panel.contains(document.activeElement)) allReturn.focus({ preventScroll: true }); }
    panel.setAttribute('aria-hidden', String(!open));
    [btn, $('#steps-pill')].forEach(function (x) { if (x) x.setAttribute('aria-expanded', String(open)); });
    if (btn) btn.textContent = open ? 'Hide all steps' : 'See all steps';
    var lenis = window.AIOS_MOTION && window.AIOS_MOTION.lenis; if (lenis) { if (open) lenis.stop(); else lenis.start(); }
  }
  $('#toggle-all').addEventListener('click', function () { toggleAll(); });
  $('#steps-pill').addEventListener('click', function () { toggleAll(); });
  $('#as-close').addEventListener('click', function () { toggleAll(false); });
  $('#as-scrim').addEventListener('click', function () { toggleAll(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && $('#all-steps').classList.contains('is-open')) toggleAll(false); });

  /* "Clear my ticks" exists twice: in the strip (wide screens) and inside the "See all steps" panel (narrow screens). */
  var clearArmed = false, clearTimer;
  function clearLabel(t) { $all('[data-clear]').forEach(function (x) { x.textContent = t; }); }
  $all('[data-clear]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!clearArmed) { clearArmed = true; clearLabel('Click again to clear all ticks'); clearTimer = setTimeout(function () { clearArmed = false; clearLabel('Clear my ticks'); }, 4000); return; }
      clearTimeout(clearTimer); clearArmed = false; clearLabel('Clear my ticks');
      state.ticks = {}; state.aware = false; prevCount = null; prevParts = null; renderProgress.sig = null; save(); render({}); announce('All ticks cleared.');
    });
  });

  /* "Presenting on a screen? Larger text": only makes the type and the step numbers bigger. */
  $all('[data-big]').forEach(function (b) {
    b.addEventListener('click', function () {
      state.big = !state.big; save();
      document.documentElement.classList.toggle('big', state.big && currentView() === 'install');
      render({});
      announce(state.big ? 'Larger text is on.' : 'Larger text is off.');
    });
  });

  /* Click-to-enlarge pictures */
  var zoomReturn = null;
  function openZoom(b) {
    var z = $('#zoom');
    var zi = $('#zoom img');
    zi.style.width = '';
    zi.onload = function () { zi.style.width = Math.min(zi.naturalWidth * 2, 1200, window.innerWidth * 0.96) + 'px'; };
    zi.src = b.dataset.src; zi.alt = b.dataset.alt || '';
    if (zi.complete && zi.naturalWidth) zi.onload();
    zoomReturn = b; z.hidden = false; $('#zoom-close').focus();
  }
  function closeZoom() { $('#zoom').hidden = true; if (zoomReturn) zoomReturn.focus(); zoomReturn = null; }
  $('#zoom').addEventListener('click', function (e) { if (e.target === this || e.target.closest('#zoom-close')) closeZoom(); });

  /* The video player for "Watch this step" */
  var vidReturn = null;
  function openVideo(t, b) {
    var m = $('#vmodal');
    $('#vmodal-title').textContent = 'Watch this step (from ' + clock(t) + ')';
    $('#vmodal').style.setProperty('--ar', aspect().toFixed(4));
    $('#vmodal-player').innerHTML = playerHTML(t, true, 'This step in the walkthrough video');
    armVideo($('#vmodal-player'));
    vidReturn = b; m.hidden = false; $('#vmodal-close').focus();
  }
  function closeVideo() { $('#vmodal-player').innerHTML = ''; $('#vmodal').hidden = true; if (vidReturn) vidReturn.focus(); vidReturn = null; }
  $('#vmodal').addEventListener('click', function (e) { if (e.target === this || e.target.closest('#vmodal-close')) closeVideo(); });

  document.addEventListener('keydown', function (e) {
    var open = !$('#zoom').hidden ? $('#zoom') : (!$('#vmodal').hidden ? $('#vmodal') : null);
    if (!open) return;
    if (e.key === 'Escape') { if (open.id === 'zoom') closeZoom(); else closeVideo(); return; }
    if (e.key !== 'Tab') return;
    /* Tab cycles inside the open picture or video, never out to the page behind it. */
    var f = $all('button, iframe, video[controls]', open);
    var i = f.indexOf(document.activeElement);
    e.preventDefault();
    f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
  });
  /* Keep the keyboard inside an open picture or video. */
  document.addEventListener('focusin', function (e) {
    var open = !$('#zoom').hidden ? $('#zoom') : (!$('#vmodal').hidden ? $('#vmodal') : null);
    if (open && !open.contains(e.target)) { var c = open.querySelector('button'); if (c) c.focus(); }
  });

  /* Skip link: straight to the step (install page) or to the main content (other pages) */
  $('#skip').addEventListener('click', function (e) {
    e.preventDefault();
    if (currentView() === 'install') { toStep(); $('#screen').focus({ preventScroll: true }); }
    else { var m = $('main'); m.setAttribute('tabindex', '-1'); m.focus(); }
  });

  /* ---------- Other pages: things arrive as you scroll to them ---------- */
  var io = null;
  function setupReveals() {
    if (!motionOK() || !('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('js-motion');
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) reveal(en.target); });
    }, { rootMargin: '0px 0px -25% 0px' });  /* fires when the top of a block is a quarter of the way up the screen ("top 75%") */
    /* Headings: masked words. */
    $all('#view-what h2, #view-help h1').forEach(function (h) { h.setAttribute('data-split', ''); split(h); h.classList.add('rv-words'); io.observe(h); });
    /* Cards and rows: settle in, 80 ms apart within their group. */
    ['#view-what .three > .tile', '#view-what .agents > .agent', '#view-what .promise li', '#view-what .example li', '#view-help .help-card', '#view-what .promise .brief-card']
      .forEach(function (sel) { $all(sel).forEach(function (el, i) { el.classList.add('rv'); el.style.setProperty('--d', (i * 80) + 'ms'); io.observe(el); }); });
    /* Hero: a short opening sequence, all readable within about a second. */
    var hero = $('#view-what .hero');
    var h1 = $('h1', hero); h1.setAttribute('data-split', ''); split(h1); h1.classList.add('rv-words'); h1.dataset.base = '0';
    $all('.hero p, .hero .btn', hero).forEach(function (el, i) { el.classList.add('rv'); el.style.setProperty('--d', (180 + i * 90) + 'ms'); });
    $('.hero-img', hero).classList.add('rv-wipe');
    [h1].concat($all('.hero p, .hero .btn, .hero-img', hero)).forEach(function (el) { io.observe(el); });
  }

  function reveal(el) {
    if (el.classList.contains('rv-in')) return;
    if (io) io.unobserve(el);
    if (el.hasAttribute('data-split')) lineDelays(el, +(el.dataset.base || 0));
    el.classList.add('rv-in');
  }
  /* Whatever is already on screen when a page opens arrives straight away, so there is never a blank gap. */
  function revealOnScreen() {
    if (!io) return;
    requestAnimationFrame(function () {
      $all('.rv:not(.rv-in), .rv-words:not(.rv-in), .rv-wipe:not(.rv-in)').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.width && r.top < window.innerHeight && r.bottom > 0) reveal(el);
      });
    });
  }

  /* ---------- Views (hash routing) ---------- */
  function hashStep() { var m = /^#install\/(\d+)$/.exec(location.hash); return m ? Math.min(+m[1], screens.length - 1) : null; }
  function currentView() {
    var h = (location.hash || '#what').slice(1);
    if (h.indexOf('help') === 0) return 'help';
    if (h.indexOf('install') === 0) return 'install';
    return ['what', 'install', 'help', 'playbook'].indexOf(h) >= 0 ? h : 'what';
  }
  var titles = { what: 'What AIOS does', install: 'Install AIOS', help: 'Get help', playbook: 'The Playbook' };
  var lastView = null;
  function showView() {
    var v = currentView();
    toggleAll(false); /* the panel is never remembered: a new page or a reload starts with it closed */
    /* :not(html): the page root carries data-view too (for the CSS), and must never be hidden with the views.
       (Maxx 2026-11-17: "Install AIOS just goes white and I have to click refresh".) */
    $all('[data-view]:not(html)').forEach(function (s) { s.hidden = s.dataset.view !== v; });
    $all('[data-nav]').forEach(function (a) { if (a.dataset.nav === v) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    $all('[data-hide-on]').forEach(function (a) { a.hidden = a.dataset.hideOn === v; });
    document.title = titles[v] + ' | Chirag Shah Coaching';
    document.documentElement.classList.toggle('big', v === 'install' && state.big);
    document.documentElement.setAttribute('data-view', v);
    $('#skip').textContent = v === 'install' ? 'Skip to the step' : 'Skip to the main content';
    var h = location.hash.slice(1);
    /* #help-install, #what-agents...: open the page at that part (used by "Back to the four agents" on the Playbook). */
    var t = /^(help|what)-/.test(h) ? document.getElementById(h) : null;
    if (t) { var lenis = window.AIOS_MOTION && window.AIOS_MOTION.lenis; window.scrollTo(0, t.getBoundingClientRect().top + window.pageYOffset - 24); if (lenis) lenis.scrollTo(window.pageYOffset, { immediate: true, force: true }); }
    else window.scrollTo(0, 0);
    if (v === 'install') {
      var n = hashStep();
      if (n !== null && n !== state.screen) { state.screen = n; save(); }
      render({ dir: lastView === 'install' ? null : 'fwd' });
      try { history.replaceState(null, '', '#install/' + state.screen); } catch (e) { /* fine */ }
      if (compact() && state.screen > 1) toStep();
    }
    if (v === 'what') renderResume();
    if (v === 'what' || v === 'help') revealOnScreen();
    lastView = v;
  }
  /* Browser Back and Forward move one step inside the install, like the page's own Back button. */
  /* Browser Back/Forward (buttons or a two-finger swipe) between pages: the motion layer may hold the change
     until it has a picture of the old page, so the move animates instead of jumping (js/motion.js). */
  function onRoute(e) {
    var v = currentView();
    var uaAnim = e && e.type === 'popstate' && e.hasUAVisualTransition;
    if (!uaAnim && lastView && v !== lastView && window.AIOS_DEFER_ROUTE && window.AIOS_DEFER_ROUTE(lastView, v, routeNow)) return;
    routeNow();
  }
  function routeNow() {
    var v = currentView(), n = hashStep();
    if (v === 'install' && lastView === 'install' && n !== null) {
      if (n !== state.screen) go(n, n < state.screen ? 'back' : 'fwd', { fromHistory: true });
      return;
    }
    showView();
  }
  window.addEventListener('hashchange', onRoute);
  window.addEventListener('popstate', onRoute);
  /* Two tabs open on the guide: the other tab's ticks show up here too. */
  window.addEventListener('storage', function (e) {
    if (e.key !== KEY || !e.newValue) return;
    try { var s = JSON.parse(e.newValue); if (s && s.ticks) { state.ticks = s.ticks; renderProgress.sig = null; if (currentView() === 'install') render({}); else renderResume(); } } catch (err) { /* ignore */ }
  });

  load();
  /* Load the step pictures up front (13 small files), so each step can be measured with its picture in place. */
  PARTS.forEach(function (p) { p.steps.forEach(function (st) { if (st.img) { var im = new Image(); im.src = st.img; } }); });
  rollify(document);
  showStorageNote();
  setupReveals();
  showView();
})();
