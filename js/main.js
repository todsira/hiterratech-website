/* HiTerratech — site behaviour (no dependencies) */
(function () {
  'use strict';
  var doc = document, body = doc.body;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };

  /* ---------- Language (TH / EN) ---------- */
  var langBtns = $$('.lang button');
  function setLang(l) {
    body.setAttribute('data-lang', l);
    doc.documentElement.lang = l;
    langBtns.forEach(function (b) { b.classList.toggle('on', b.dataset.set === l); });
    try { localStorage.setItem('ht-lang', l); } catch (e) {}
  }
  var saved = null;
  try { saved = localStorage.getItem('ht-lang'); } catch (e) {}
  setLang(saved || ((navigator.language || 'th').toLowerCase().indexOf('th') === 0 ? 'th' : 'en'));
  langBtns.forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.set); }); });

  /* ---------- Mobile menu ---------- */
  var menuBtn = doc.querySelector('.menu-btn'), nav = doc.querySelector('.nav-links');
  function closeMenu() { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
  menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  $$('.nav-links a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  doc.getElementById('yr').textContent = new Date().getFullYear();

  /* ---------- Scroll reveal ---------- */
  var rv = $$('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  /* ---------- Active nav link ---------- */
  var links = $$('.nav-links a[href^="#"]');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['about', 'services', 'work', 'group', 'contact'].forEach(function (id) {
      var s = doc.getElementById(id); if (s) spy.observe(s);
    });
  }

  /* ---------- Header shadow + progress bar ---------- */
  var header = doc.querySelector('header'), bar = doc.querySelector('.progress'), ticking = false;
  function onScroll() {
    var y = window.pageYOffset, h = doc.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', y > 8);
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(y / h, 1) : 0) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Cursor spotlight on cards ---------- */
  $$('.spot').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- Hero image 3D tilt ---------- */
  var tilt = doc.querySelector('.tilt');
  if (tilt && !reduce && window.matchMedia('(hover:hover)').matches) {
    var hm = tilt.parentNode;
    hm.addEventListener('pointermove', function (e) {
      var r = hm.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = 'rotateY(' + (x * 6).toFixed(2) + 'deg) rotateX(' + (-y * 6).toFixed(2) + 'deg)';
    });
    hm.addEventListener('pointerleave', function () { tilt.style.transform = ''; });
  }

  /* ---------- Hero: flowing terrain-line canvas ---------- */
  var cv = doc.getElementById('topo');
  if (cv && cv.getContext) {
    var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1, running = false, t = 0;
    var mouse = { x: -9999, y: -9999 }, hero = cv.parentNode, grad;
    var LINES = 24;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = hero.clientWidth; H = hero.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, 'rgba(222,24,96,.55)');
      grad.addColorStop(1, 'rgba(121,44,135,.55)');
      draw();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      var gap = H / (LINES + 2), step = Math.max(6, W / 160);
      for (var i = 1; i <= LINES; i++) {
        var base = i * gap, ph = i * 0.42;
        ctx.globalAlpha = 0.05 + 0.12 * (i / LINES);
        ctx.strokeStyle = grad;
        ctx.beginPath();
        for (var x = 0; x <= W + step; x += step) {
          var y = base
            + Math.sin(x * 0.006 + t + ph) * 14
            + Math.sin(x * 0.014 - t * 0.7 + ph * 1.7) * 6;
          var dx = x - mouse.x, dy = base - mouse.y, d2 = dx * dx + dy * dy;
          y -= 26 * Math.exp(-d2 / 26000);          // gentle "hill" under the cursor
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    function loop() { if (!running) return; t += 0.006; draw(); requestAnimationFrame(loop); }
    function start() { if (!running && !reduce) { running = true; requestAnimationFrame(loop); } }
    function stop() { running = false; }

    resize();
    window.addEventListener('resize', resize);
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    hero.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });
    doc.addEventListener('visibilitychange', function () { doc.hidden ? stop() : start(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es[0].isIntersecting ? start() : stop(); }).observe(hero);
    } else start();
  }
})();
