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

  /* ------------------------------------------------------------
     Work-list timeline. Recreates azizkhaldi.com's experience
     scroll: progress runs 0→1 as the list travels from "top at
     viewport centre" to "bottom at viewport centre", driving the
     centre line's height, the dot states, and the swirl's
     stroke-dashoffset.

     Two deliberate departures from their version:

     1. They map progress straight to arc length
        (strokeDashoffset = len * (1 - progress)). Arc length is not
        vertical position — this path spends most of its length on
        wide horizontal sweeps — so the drawn head drifts up to 12%
        of the path's height behind the reader. Their section is
        ~5 screens, where that is a few hundred pixels. Ours is ~12,
        where it is well over a full viewport and the head leaves
        the screen. So progress is mapped through a length-for-height
        table instead, which is what "follows the scroll" needs.

     2. GSAP's scrub:1 does the smoothing there. Here it is a small
        rAF lerp toward the target, which is the same effect without
        the dependency.
     ------------------------------------------------------------ */

  /* Sample the path into a monotonic height→length table.
     Lengths are measured in SCREEN space, not user space. The swirl
     uses vector-effect:non-scaling-stroke, and under that Chrome
     resolves stroke-dasharray against the rendered geometry — while
     getTotalLength() reports user units. The viewBox is stretched
     ~3x vertically, so the two disagree by that factor and every
     user-unit offset lands in the wrong place. Projecting each
     sample through the CTM puts the dash values in the same space
     the stroke is actually drawn in. */
  function buildLut(el) {
    var total = el.getTotalLength();
    var ctm = el.getScreenCTM();
    if (!total || !ctm) return null;

    var n = 400, ls = [], ys = [], minY = Infinity, maxY = -Infinity;
    var run = 0, prev = null, i, pt, sx, sy;

    for (i = 0; i <= n; i++) {
      pt = el.getPointAtLength(total * i / n);
      sx = ctm.a * pt.x + ctm.c * pt.y + ctm.e;
      sy = ctm.b * pt.x + ctm.d * pt.y + ctm.f;
      if (prev) {
        var dx = sx - prev[0], dy = sy - prev[1];
        run += Math.sqrt(dx * dx + dy * dy);
      }
      prev = [sx, sy];
      ls.push(run);
      ys.push(sy);
      if (sy < minY) minY = sy;
      if (sy > maxY) maxY = sy;
    }
    /* the curve doubles back vertically in places; clamping to
       non-decreasing keeps the lookup stable and stops the drawn
       head from retreating mid-scroll */
    for (i = 1; i < ys.length; i++) if (ys[i] < ys[i - 1]) ys[i] = ys[i - 1];

    return { total: run, ls: ls, ys: ys, minY: minY, span: (maxY - minY) || 1 };
  }

  /* Height mapping, at full weight.
     Their path needed an arc-length term blended in: it has a ~6%
     stretch running almost flat, where a pure height lookup freezes
     the head and then jumps it. The serpentine replacing it puts
     both Bezier controls on each span's vertical midpoint, so it is
     strictly monotonic in y — no flat bands, nothing to stall on,
     and the head can sit exactly level with the reader. */
  var HEIGHT_W = 1;

  /* How far ahead of the scroll the swirl runs. LEAD is the exponent
     on 1-(1-v)^n: 1 is level with the centre line, higher is faster.
     OFFSET is a flat head start in section fractions.

     Both sit at "level" now. At 1.45/0.06 the head ran so far ahead
     that it was off-screen at five of six scroll positions — measured
     1183-2170px below a 900px viewport — so the reader only ever saw
     a stroke passing through, never an end being drawn. Level keeps
     the head on the centre line, which is the part worth watching. */
  var SWIRL_LEAD = 1;
  var SWIRL_OFFSET = 0;


  /* Progress of a box against the scroll it can actually receive.

     The old measure was "where is the viewport centre inside the box",
     which only reaches 1 when at least half a viewport of content sits
     below the box. On /work/ there are 84px below it, so progress
     stopped at 0.952 — the swirl finished at 65% and the centre line
     at 96%, and neither ever completed. Anchoring the end on "box
     bottom resting on the viewport bottom", clamped to the document's
     real scroll range, means the last pixel of scroll always finishes
     the stroke. */
  function scopeProgress(topDoc, h, sy) {
    var vh = window.innerHeight;
    var maxSy = Math.max(0, docEl.scrollHeight - vh);
    var start = topDoc - vh;
    var end = topDoc + h - vh;
    if (start < 0) start = 0;
    if (end > maxSy) end = maxSy;
    if (end <= start) return sy >= end ? 1 : 0;
    var p = (sy - start) / (end - start);
    return p < 0 ? 0 : p > 1 ? 1 : p;
  }

  function lenAtHeight(lut, frac) {
    var y = lut.minY + lut.span * frac;
    var lo = 0, hi = lut.ys.length - 1, mid;
    while (lo < hi) {
      mid = (lo + hi) >> 1;
      if (lut.ys[mid] < y) lo = mid + 1; else hi = mid;
    }
    return HEIGHT_W * lut.ls[lo] + (1 - HEIGHT_W) * lut.total * frac;
  }

  function workRail() {
    var list = document.querySelector('[data-rail]');
    if (!list) return;
    var fill = list.querySelector('.work-progress');
    var items = [].slice.call(list.querySelectorAll('.work-item'));
    if (!fill) return;

    /* The swirl spans About + Work, so it lives on the scope wrapper
       rather than inside the work list. The centre line and dots stay
       scoped to the list. */
    var scope = document.querySelector('[data-swirl-scope]') || list;
    var swirls = [].slice.call(scope.querySelectorAll('.work-swirl path'))
      .filter(function (el) { return typeof el.getTotalLength === 'function'; });
    var lut = null;

    /* ---- path built from where the content actually sits ----
       The lobes used to be spaced evenly across the viewBox, which
       only lined up while every anchor was the same height. Across
       About + Work they are not: About centres at 11.4% of the scope
       and the work items follow at ~9.3% intervals, so even spacing
       drifted a whole card by the end. Measuring each anchor and
       placing its lobe at its own fraction keeps them locked
       whatever the section heights do. */
    var VB = 4800, XL = 220, XR = 980, XMID = 600;

    function anchors() {
      var a = [];
      var about = document.querySelector('#about');
      if (about) a.push(about);
      return a.concat(items);
    }

    function buildPath() {
      var sr = scope.getBoundingClientRect();
      var top = sr.top + window.pageYOffset, h = sr.height;
      if (!h) return null;

      var nodes = [[XMID, 0]], list2 = anchors();
      for (var i = 0; i < list2.length; i++) {
        var er = list2[i].getBoundingClientRect();
        var c = er.top + window.pageYOffset + er.height / 2 - top;
        var y = (c / h) * VB;
        if (y < 1) y = 1; else if (y > VB - 1) y = VB - 1;
        /* index 0 is About; work item 1 must swing right, since its
           content sits on the left */
        nodes.push([i % 2 === 0 ? XL : XR, y]);
      }
      nodes.push([XMID, VB]);

      var d = 'M' + nodes[0][0] + ' ' + nodes[0][1];
      for (var k = 1; k < nodes.length; k++) {
        var a0 = nodes[k - 1], b0 = nodes[k];
        if (b0[1] <= a0[1]) b0[1] = a0[1] + 1;   /* keep y monotonic */
        var mid = a0[1] + (b0[1] - a0[1]) / 2;
        d += 'C' + a0[0] + ' ' + mid.toFixed(1) + ' ' + b0[0] + ' ' +
             mid.toFixed(1) + ' ' + b0[0] + ' ' + b0[1].toFixed(1);
      }
      return d;
    }

    /* screen-space measurements depend on the CTM, so the table has
       to be rebuilt whenever the element is rescaled */
    /* Never clobber a working table with a failed measurement.
       buildLut returns null whenever getScreenCTM() does — which can
       happen on a transient relayout — and the old code assigned that
       null straight to `lut`. From then on paint() skipped the swirl
       entirely, so it froze at whatever dashoffset it last held and
       never moved again. A stale table is always better than none. */
    function measurePath() {
      if (!swirls.length) return;
      /* geometry first — the table is sampled off the path, so the
         path has to be current before it is measured */
      var d = null;
      try { d = buildPath(); } catch (e) { d = null; }
      if (d) swirls.forEach(function (el) { el.setAttribute('d', d); });

      var next = null;
      try { next = buildLut(swirls[0]); } catch (e) { next = null; }
      if (!next) return;
      lut = next;
      /* The table measures the path in SCREEN space, but stroke-dasharray
         and stroke-dashoffset are user units. preserveAspectRatio="none"
         scales x and y differently, so the two lengths are nowhere near
         equal — feeding the screen length to dasharray made the pattern
         longer than the path, and the stroke read as fully drawn about
         halfway down. Dash in user units; use the table only for the
         fraction. */
      swirls.forEach(function (el) {
        el.__pathLen = el.getTotalLength();
        el.style.strokeDasharray = el.__pathLen;
      });
    }

    /* Two boxes, two progresses. The centre line is normalised to the
       work list; the swirl runs over the wider About+Work scope.

       These have to be measured independently. Deriving the swirl's
       progress from the line's looked equivalent but was not: the
       line's progress clamps to 0 until the work list reaches the
       viewport centre, so all the way down About the swirl was pinned
       at scope 22.8% — drawn, but frozen. Easing raw scroll position
       instead and computing each progress from its own box means the
       swirl starts moving the moment the scope does. */
    var listTopDoc = 0, listH = 1, scopeTopDoc = 0, scopeH = 1;

    function measureBoxes() {
      var lr = list.getBoundingClientRect();
      var sr = scope.getBoundingClientRect();
      var sy = window.pageYOffset;
      listTopDoc = lr.top + sy; listH = lr.height || 1;
      scopeTopDoc = sr.top + sy; scopeH = sr.height || 1;
    }

    /* delegates to the shared measure so the line, the dots and the
       swirl all finish together */
    function boxProgress(topDoc, h, sy) {
      return scopeProgress(topDoc, h, sy);
    }

    measureBoxes();
    measurePath();

    /* The table is measured in screen space, so it is only valid for
       the section's current height — and that height is still moving
       at DOMContentLoaded. Web fonts are the big one: the work titles
       run to 56px, and a fallback→Switzer swap re-wraps them and
       shifts the whole column. A stale table leaves strokeDasharray
       shorter than the real path, so the dash repeats and the head
       never reaches the reader — the stroke looks like it is lagging
       and never catches up. Re-measure whenever the box changes. */
    function remeasure() { measureBoxes(); measurePath(); schedule(); }

    window.addEventListener('load', remeasure);
    if (document.fonts && document.fonts.ready &&
        typeof document.fonts.ready.then === 'function') {
      document.fonts.ready.then(remeasure)['catch'](function () {});
    }
    if (typeof window.ResizeObserver === 'function') {
      var ro = new window.ResizeObserver(remeasure);
      ro.observe(list);
      if (scope !== list) ro.observe(scope);
    }

    var target = 0, eased = 0, raf = null;

    /* What gets eased is raw scroll position, not a normalised
       progress — each box then derives its own unclamped progress
       from it. */
    function measure() { return window.pageYOffset; }

    function paint(sy) {
      var v = boxProgress(listTopDoc, listH, sy);
      /* Theirs uses 93% here, which holds the line just short of the
         end — it pairs with a separate trigger that fades the whole
         line out on the last item. That 7% is a fixed fraction of
         section height: ~320px for them, but ~770px here, enough to
         push the line's head off screen for most of the scroll. At
         100% the head tracks the viewport centre, so it stays in
         step with the swirl's head rather than trailing it. */
      fill.style.height = (v * 100) + '%';

      /* The swirl runs ahead of the centre line rather than level with
         it, so each item's blank half is already filled by the time
         you reach it.

         Eased rather than a flat multiplier: v * 1.5 would finish the
         path at two-thirds of the section and leave the last items
         with a dead, fully-drawn stroke. 1-(1-v)^LEAD leads hardest
         early, where the gap is most visible, and still lands exactly
         on 1 at the end. OFFSET is a small head start on top. */
      if (lut) {
        /* the swirl runs over About + Work, the line only over Work */
        var vs = boxProgress(scopeTopDoc, scopeH, sy);
        /* base is clamped before Math.pow: a negative base with a
           fractional exponent returns NaN, and a NaN dashoffset blanks
           the stroke outright rather than just misplacing it */
        var base = 1 - vs;
        if (base < 0) base = 0; else if (base > 1) base = 1;

        var sv = 1 - Math.pow(base, SWIRL_LEAD) + SWIRL_OFFSET;
        if (!(sv >= 0)) sv = 0; else if (sv > 1) sv = 1;

        var len = lenAtHeight(lut, sv);
        if (len >= 0 && lut.total) {
          var frac = len / lut.total;
          if (frac < 0) frac = 0; else if (frac > 1) frac = 1;
          for (var s = 0; s < swirls.length; s++) {
            var L = swirls[s].__pathLen || swirls[s].getTotalLength();
            swirls[s].style.strokeDashoffset = L * (1 - frac);
          }
        }
      }

      var r = list.getBoundingClientRect();
      var y = r.top + r.height * v;   /* where the stroke head sits */

      for (var i = 0; i < items.length; i++) {
        var ir = items[i].getBoundingClientRect();
        items[i].classList.toggle('is-passed', ir.top + ir.height / 2 <= y);

        /* .is-active mirrors :hover, driven by the stroke rather than
           the pointer — the item lifts while the head crosses it and
           settles once it moves on.

           Tested against the item box, not the card: .is-active
           translates the card, so measuring the card would move the
           very boundary being tested and chatter on and off at the
           edge. A child's transform can't alter the item's own rect. */
        items[i].classList.toggle('is-active', y >= ir.top && y <= ir.bottom);
      }
    }

    /* Easing is an enhancement, never a dependency: if rAF is missing
       or the reader asked for reduced motion, scroll paints straight
       to position. Only the smoothing needs a frame loop, so a
       starved rAF can never leave the line and swirl unpainted. */
    var smooth = !reduce && typeof window.requestAnimationFrame === 'function';

    /* Stand-in for GSAP's scrub. Time-based rather than a fixed
       per-frame fraction: a flat 0.12/frame is ~8 frames of lag at
       60Hz but ~8 frames at 120Hz too, so the stroke trails twice as
       far on a fast display and never appears to catch up. Easing on
       elapsed time makes the settle take the same 60ms everywhere. */
    var TAU = 0.06, lastT = 0;

    function tick(now) {
      /* Cleared first, not last. schedule() only starts a loop when
         raf is null, so if paint() ever threw mid-frame the id stayed
         set forever and no later scroll could restart it — the whole
         timeline froze wherever it happened to be. Clearing on entry
         means a thrown frame costs one frame, not the session. */
      raf = null;

      var dt = lastT ? (now - lastT) / 1000 : 1 / 60;
      lastT = now;
      if (dt > 0.1) dt = 0.1;           /* after a tab switch, don't jump */

      var d = target - eased;
      if (d < 0.4 && d > -0.4) {
        eased = target;
        lastT = 0;
        paint(eased);
        return;
      }
      eased += d * (1 - Math.exp(-dt / TAU));
      paint(eased);
      raf = window.requestAnimationFrame(tick);
    }

    function schedule() {
      target = measure();
      if (!smooth) {
        eased = target;
        paint(eased);
        return;
      }
      if (raf === null) raf = window.requestAnimationFrame(tick);
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', function () { measureBoxes(); measurePath(); schedule(); });

    /* no easing on first paint — the page should not animate in from
       zero if it loads part-scrolled */
    target = eased = measure();
    paint(eased);
  }

  /* ------------------------------------------------------------
     About section. Ported from azizkhaldi.com:
       .years-counter / .projects-counter  innerText 0->n, 2s,
         power2.out, snapped to integers, "+" appended, fired once
         at "top 70%" with toggleActions "play none none none"
       .profile-photo  width 60%->100% + scale .95->1, scrubbed
         from "top bottom" to "top 20%"
     ------------------------------------------------------------ */
  function aboutMotion() {
    var sec = document.querySelector('[data-about]');
    if (!sec) return;

    /* ---- counters ---- */
    var nums = [].slice.call(sec.querySelectorAll('[data-count]'));

    function target(el) { return parseInt(el.getAttribute('data-count'), 10) || 0; }

    function count(el) {
      var to = target(el), dur = 2000, t0 = 0;
      el.textContent = '0+';
      function frame(now) {
        if (!t0) t0 = now;
        var t = (now - t0) / dur;
        if (t > 1) t = 1;
        var e = 1 - Math.pow(1 - t, 2);          /* power2.out */
        /* ceil, matching their onUpdate, so it never shows a value
           it has not actually reached */
        el.textContent = Math.ceil(e * to) + '+';
        if (t < 1) window.requestAnimationFrame(frame);
        else el.textContent = to + '+';
      }
      window.requestAnimationFrame(frame);
    }

    if (reduce || !hasIO) {
      nums.forEach(function (el) { el.textContent = target(el) + '+'; });
    } else {
      var started = [];

      function fire(el) {
        if (started.indexOf(el) !== -1) return;  /* play once */
        started.push(el);
        count(el);
      }

      function onScreen(el) {
        var r = el.getBoundingClientRect();
        return r.top < window.innerHeight && r.bottom > 0;
      }

      /* Same observer options as the reveal pass above, which is known
         to fire reliably here. */
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          cio.unobserve(e.target);
          fire(e.target);
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

      nums.forEach(function (el) {
        if (onScreen(el)) { fire(el); return; }  /* already visible on load */
        cio.observe(el);
      });

      /* Same safety net the reveal pass uses: never leave a counter
         sitting at zero if it is actually on screen. */
      window.setTimeout(function () {
        nums.forEach(function (el) { if (onScreen(el)) fire(el); });
      }, 1200);
    }

    /* ---- panel + portrait ---- */
    var photo = sec.querySelector('[data-portrait]');
    var panel = sec.querySelector('[data-panel]');
    if (reduce || (!photo && !panel)) return;

    var queued = false;
    var gutter = 0;

    /* the shell's own padding is the widest the clip can go without
       touching content; re-read it because the gutter is a clamp() */
    function measureGutter() {
      var shell = sec.querySelector('.shell');
      gutter = shell ? parseFloat(window.getComputedStyle(shell).paddingLeft) || 0 : 0;
    }
    measureGutter();

    function draw() {
      queued = false;
      var vh = window.innerHeight;

      /* panel: their start "top 80%" -> end "top 10%", squaring off
         from a 34px-radius inset card into the full-bleed section.

         The inset is capped at the shell's own gutter. Theirs animates
         real width, so the column re-wraps and nothing is lost; a clip
         at 10% instead slices straight through the copy — the section
         head came out reading "T ... BENGALURU,". Stopping the clip at
         the gutter means it only ever eats empty margin. */
      if (panel) {
        var pr = panel.getBoundingClientRect();
        var pp = (vh * 0.8 - pr.top) / (vh * 0.7);
        pp = pp < 0 ? 0 : pp > 1 ? 1 : pp;
        var pe = 1 - Math.pow(1 - pp, 3);
        var inv = 1 - pe;
        panel.style.clipPath =
          'inset(0 ' + (gutter * inv).toFixed(1) + 'px round ' + (34 * inv).toFixed(2) + 'px)';
        panel.style.transform = 'translateY(' + (120 * inv).toFixed(2) + 'px)';
      }

      if (!photo) return;
      var r = photo.getBoundingClientRect();
      /* their start/end: top at viewport bottom -> top at 20% */
      var p = (vh - r.top) / (vh * 0.8);
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      var e = 1 - Math.pow(1 - p, 3);
      photo.style.transform = 'scale(' + (0.82 + 0.18 * e).toFixed(4) + ')';

      /* Parallax + grade, keyed to the frame's travel across the
         viewport rather than its entry, so they keep moving the whole
         way past instead of finishing on arrival.

         Normalised over the span where the frame is actually on
         screen, not (vh + height)/2. That wider divisor only reaches
         ±1 once the frame is fully outside the viewport, so while it
         was visible cross never left ±0.28 — the parallax used barely
         a quarter of its range and came out at ~10px, invisible. */
      var span = (vh - r.height) / 2;
      if (span < 40) span = (vh + r.height) / 2;   /* frame taller than the fold */
      var cross = ((r.top + r.height / 2) - vh / 2) / span;
      if (cross < -1) cross = -1; else if (cross > 1) cross = 1;

      /* the image is 124% of the frame, so 12% is free at each edge */
      var travel = r.height * 0.10;
      photo.style.setProperty('--py', (-cross * travel).toFixed(1) + 'px');

      /* Muted on approach, full colour once centred — the red light is
         the subject, so it arrives rather than being on from the off. */
      var mid = 1 - Math.abs(cross);
      photo.style.setProperty('--grade', (0.62 + 0.38 * mid).toFixed(3));
    }

    function sched() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(draw);
    }

    window.addEventListener('scroll', sched, { passive: true });
    window.addEventListener('resize', function () { measureGutter(); sched(); });
    draw();

    /* ---- pointer light ----
       The photograph is a spotlit subject on a dark ground, so the
       cursor carries a light rather than tilting the frame. Coalesced
       into the same rAF budget, and skipped on coarse pointers where
       there is no cursor to follow. */
    if (photo && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
      var pending = null;

      function paintGlow() {
        pending = null;
        photo.style.setProperty('--mx', glowX.toFixed(1) + '%');
        photo.style.setProperty('--my', glowY.toFixed(1) + '%');
      }
      var glowX = 50, glowY = 50;

      photo.addEventListener('pointermove', function (ev) {
        var b = photo.getBoundingClientRect();
        if (!b.width || !b.height) return;
        glowX = ((ev.clientX - b.left) / b.width) * 100;
        glowY = ((ev.clientY - b.top) / b.height) * 100;
        if (pending === null) pending = window.requestAnimationFrame(paintGlow);
      }, { passive: true });

      photo.addEventListener('pointerleave', function () {
        glowX = 50; glowY = 50;
        if (pending === null) pending = window.requestAnimationFrame(paintGlow);
      });
    }
  }

  /* ------------------------------------------------------------
     Capabilities — pinned horizontal scroll.
     Theirs: distance = track.scrollWidth - innerWidth + 200, the
     section pinned for that distance and the track tweened to -x,
     scrubbed, only above 1024px. Here position:sticky does the
     pinning, so all this has to do is size the section to supply
     the scroll and map that range onto translateX.
     ------------------------------------------------------------ */
  function capScroll() {
    var sec = document.querySelector('[data-cap]');
    if (!sec) return;
    var track = sec.querySelector('[data-cap-track]');
    var sticky = sec.querySelector('.cap-sticky');
    if (!track || !sticky) return;

    var dist = 0, queued = false;

    function active() {
      return !reduce && window.innerWidth >= 1024;
    }

    function measure() {
      if (!active()) {
        dist = 0;
        sec.style.height = '';
        track.style.transform = '';
        return;
      }
      /* their +200 tail, so the last card clears the right edge
         rather than stopping flush against it */
      dist = Math.max(0, track.scrollWidth - window.innerWidth + 200);
      /* Section height = the sticky element's own height plus the
         distance it must consume. Using innerHeight here would be
         wrong now that the sticky is inset by the nav — it would pin
         for nav-height longer than the track actually travels. */
      sec.style.height = (sticky.offsetHeight + dist) + 'px';
    }

    function draw() {
      queued = false;
      if (!active() || !dist) return;
      var r = sec.getBoundingClientRect();
      /* 0 while the top is at the viewport top, 1 once the section
         has travelled its full extra height */
      var p = -r.top / dist;
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      track.style.transform = 'translate3d(' + (-dist * p).toFixed(1) + 'px,0,0)';
    }

    function sched() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(draw);
    }

    function remeasure() { measure(); draw(); }

    measure();
    draw();
    window.addEventListener('scroll', sched, { passive: true });
    window.addEventListener('resize', remeasure);
    window.addEventListener('load', remeasure);
    if (document.fonts && document.fonts.ready &&
        typeof document.fonts.ready.then === 'function') {
      document.fonts.ready.then(remeasure)['catch'](function () {});
    }
    /* card widths are clamp()-based, so the track can change size
       without the window doing so */
    if (typeof window.ResizeObserver === 'function') {
      new window.ResizeObserver(remeasure).observe(track);
    }
  }

  /* ------------------------------------------------------------
     Dark scroll theme. Their trigger is start "top-=50px top",
     end "bottom bottom" — dark while the section owns the viewport,
     light again once it has passed either way.
     ------------------------------------------------------------ */
  function sectionTheme() {
    var sec = document.querySelector('[data-theme-dark]');
    if (!sec) return;

    var queued = false;

    function update() {
      queued = false;
      var r = sec.getBoundingClientRect();
      /* their top-=50px lead-in, and held until the section's bottom
         has risen past the fold */
      var on = r.top <= 50 && r.bottom >= window.innerHeight;
      docEl.classList.toggle('is-dark', on);
    }

    function sched() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', sched, { passive: true });
    window.addEventListener('resize', sched);
    update();
  }


  /* ------------------------------------------------------------
     Case-study swirl. Same gesture as the work rail's, without the
     rail: a case study has no .work-item list to hang lobes off, so
     the anchors are its own sections. workRail() returns early when
     there is no [data-rail], which is why case studies needed their
     own driver rather than a flag on that one.

     Reuses buildLut/lenAtHeight so the head tracks the reader
     identically on both — only the anchor set differs.
     ------------------------------------------------------------ */
  function csSwirl() {
    var scope = document.querySelector('[data-cs-swirl]');
    if (!scope) return;

    var paths = [].slice.call(scope.querySelectorAll('.cs-swirl path'))
      .filter(function (el) { return typeof el.getTotalLength === 'function'; });
    if (!paths.length) return;

    var anchors = [].slice.call(scope.querySelectorAll('main > section, main > header'));
    if (anchors.length < 2) return;

    var VB = 4800, XL = 220, XR = 980, XMID = 600;
    var lut = null, topDoc = 0, boxH = 1;

    function buildPath() {
      var sr = scope.getBoundingClientRect();
      var top = sr.top + window.pageYOffset, h = sr.height;
      if (!h) return null;

      var nodes = [[XMID, 0]], i, er, c, y;
      for (i = 0; i < anchors.length; i++) {
        er = anchors[i].getBoundingClientRect();
        c = er.top + window.pageYOffset + er.height / 2 - top;
        y = (c / h) * VB;
        if (y < 1) y = 1; else if (y > VB - 1) y = VB - 1;
        nodes.push([i % 2 === 0 ? XL : XR, y]);
      }
      nodes.push([XMID, VB]);

      var d = 'M' + nodes[0][0] + ' ' + nodes[0][1], k, a0, b0, mid;
      for (k = 1; k < nodes.length; k++) {
        a0 = nodes[k - 1]; b0 = nodes[k];
        if (b0[1] <= a0[1]) b0[1] = a0[1] + 1;      /* keep y monotonic */
        mid = a0[1] + (b0[1] - a0[1]) / 2;
        d += 'C' + a0[0] + ' ' + mid.toFixed(1) + ' ' + b0[0] + ' ' +
             mid.toFixed(1) + ' ' + b0[0] + ' ' + b0[1].toFixed(1);
      }
      return d;
    }

    function measure() {
      var sr = scope.getBoundingClientRect();
      topDoc = sr.top + window.pageYOffset;
      boxH = sr.height || 1;

      var d = null;
      try { d = buildPath(); } catch (e) { d = null; }
      if (d) paths.forEach(function (el) { el.setAttribute('d', d); });

      var next = null;
      try { next = buildLut(paths[0]); } catch (e) { next = null; }
      if (!next) return;                       /* keep a stale table over none */
      lut = next;
      /* user units, not the table's screen-space run — see workRail */
      paths.forEach(function (el) {
        el.__pathLen = el.getTotalLength();
        el.style.strokeDasharray = el.__pathLen;
      });
    }

    function paint(sy) {
      if (!lut) return;
      var v = scopeProgress(topDoc, boxH, sy);

      var base = 1 - v;
      if (base < 0) base = 0; else if (base > 1) base = 1;
      var sv = 1 - Math.pow(base, SWIRL_LEAD) + SWIRL_OFFSET;
      if (!(sv >= 0)) sv = 0; else if (sv > 1) sv = 1;

      var len = lenAtHeight(lut, sv);
      if (len >= 0 && lut.total) {
        var frac = len / lut.total;
        if (frac < 0) frac = 0; else if (frac > 1) frac = 1;
        for (var i = 0; i < paths.length; i++) {
          var L = paths[i].__pathLen || paths[i].getTotalLength();
          paths[i].style.strokeDashoffset = L * (1 - frac);
        }
      }
    }

    measure();
    paint(window.pageYOffset);

    window.addEventListener('load', function () { measure(); paint(window.pageYOffset); });
    if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === 'function') {
      document.fonts.ready.then(function () { measure(); paint(window.pageYOffset); })['catch'](function () {});
    }
    if (typeof window.ResizeObserver === 'function') {
      new window.ResizeObserver(function () { measure(); paint(window.pageYOffset); }).observe(scope);
    }

    /* same time-based lerp as the rail, so the head settles in the
       same ~60ms regardless of refresh rate */
    var target = window.pageYOffset, eased = target, raf = null, last = 0;
    var smooth = !reduce && typeof window.requestAnimationFrame === 'function';

    function frame(t) {
      var dt = last ? Math.min((t - last) / 1000, 0.1) : 0.016;
      last = t;
      eased += (target - eased) * (1 - Math.pow(0.0001, dt));
      paint(eased);
      if (Math.abs(target - eased) > 0.5) raf = window.requestAnimationFrame(frame);
      else { raf = null; last = 0; paint(target); }
    }

    window.addEventListener('scroll', function () {
      target = window.pageYOffset;
      if (!smooth) { paint(target); return; }
      if (raf === null) { last = 0; raf = window.requestAnimationFrame(frame); }
    }, { passive: true });
  }

  function run() {
    try { splitWords(); } catch (e) {}
    navSentinel();
    try { workRail(); } catch (e) {}
    try { csSwirl(); } catch (e) {}
    try { aboutMotion(); } catch (e) {}
    try { capScroll(); } catch (e) {}
    try { sectionTheme(); } catch (e) {}

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
