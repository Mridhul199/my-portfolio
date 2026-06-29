/* ============================================================
   reveal.js — shared, dependency-free entrance + scroll animation
   Used by the home page and both case studies.

   Best-practice guards:
   - Only animates when JS is on (the inline <head> script adds `.js`;
     the <script onerror> removes it if this file fails to load, so
     content is never left hidden).
   - GPU-only properties (opacity + transform). No layout thrash.
   - IntersectionObserver, not scroll handlers.
   - Honours prefers-reduced-motion.
   - Safety sweep reveals anything still on-screen after 1.2s.
   ============================================================ */
(function () {
  'use strict';

  var docEl = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* split a heading into per-word mask spans for the line-reveal effect */
  function splitWords() {
    document.querySelectorAll('[data-split-words]').forEach(function (el) {
      if (el.hasAttribute('data-split')) return;
      try {
        var words = el.textContent.trim().split(/\s+/);
        var frag = document.createDocumentFragment();
        words.forEach(function (w, i) {
          var outer = document.createElement('span');
          outer.className = 'w';
          outer.style.setProperty('--wi', i);
          var inner = document.createElement('span');
          inner.textContent = w;
          outer.appendChild(inner);
          frag.appendChild(outer);
          frag.appendChild(document.createTextNode(' '));
        });
        el.textContent = '';
        el.appendChild(frag);
        el.setAttribute('data-split', '');
      } catch (e) {
        el.setAttribute('data-split', '');
        el.classList.add('is-in');
      }
    });
  }

  /* case studies opt in with <body data-auto-reveal>; reveal section-level blocks */
  var AUTO = 'main > section, main > header';

  function targets() {
    var list = [].slice.call(document.querySelectorAll('[data-reveal], [data-split-words]'));
    if (document.body && document.body.hasAttribute('data-auto-reveal')) {
      [].forEach.call(document.querySelectorAll(AUTO), function (el) {
        if (list.indexOf(el) === -1) list.push(el);
      });
    }
    return list;
  }

  function revealAll(list) {
    list.forEach(function (t) { t.classList.add('is-in'); });
  }

  /* nav gains a denser background once the page is scrolled */
  function navSentinel() {
    var nav = document.querySelector('[data-nav]');
    if (!nav || !hasIO) return;
    var s = document.createElement('div');
    s.setAttribute('aria-hidden', 'true');
    s.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none';
    document.body.appendChild(s);
    new IntersectionObserver(function (es) {
      nav.classList.toggle('is-scrolled', !es[0].isIntersecting);
    }, { threshold: 0 }).observe(s);
  }

  function run() {
    try { splitWords(); } catch (e) {}
    navSentinel();

    var list = targets();

    if (reduce || !hasIO) {
      revealAll(list);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

    list.forEach(function (t) { io.observe(t); });

    /* safety: never leave on-screen content hidden */
    window.setTimeout(function () {
      list.forEach(function (t) {
        if (t.classList.contains('is-in')) return;
        var r = t.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) t.classList.add('is-in');
      });
    }, 1200);
  }

  if (document.readyState !== 'loading') run();
  else document.addEventListener('DOMContentLoaded', run);
})();
