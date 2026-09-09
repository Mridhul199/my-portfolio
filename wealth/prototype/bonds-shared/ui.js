// Tiny shared UI helper for mock interactions (toasts) across Bondly prototype screens.
// Expects each page to define a `.toast` / `.toast.show` CSS rule and a `.device` container.

function showToast(msg, ms) {
  ms = ms || 2000;
  const host = document.querySelector('.device') || document.body;
  let t = document.getElementById('__toast');
  if (!t) {
    t = document.createElement('div');
    t.id = '__toast';
    t.className = 'toast';
    host.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._hideTimer);
  t._hideTimer = setTimeout(() => t.classList.remove('show'), ms);
}

function toggleAccordion(headEl, bodyEl) {
  const open = bodyEl.style.maxHeight && bodyEl.style.maxHeight !== '0px';
  bodyEl.style.maxHeight = open ? '0px' : bodyEl.scrollHeight + 'px';
  headEl.classList.toggle('open', !open);
}

// Floating reset control, rendered outside the phone frame, on every screen.
// Takes the viewer back to the very first screen to restart the walkthrough.
(function () {
  const btn = document.createElement('a');
  btn.href = '../bonds-splash/index.html';
  btn.textContent = '↺ Reset flow';
  btn.style.cssText = [
    'position:fixed', 'top:16px', 'right:16px', 'z-index:99999',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
    'font-size:12.5px', 'font-weight:700', 'letter-spacing:.2px',
    'color:#fff', 'background:#120E26', 'padding:9px 16px', 'border-radius:999px',
    'text-decoration:none', 'box-shadow:0 8px 22px rgba(0,0,0,.3)',
    'display:inline-flex', 'align-items:center', 'gap:6px', 'cursor:pointer'
  ].join(';');
  btn.addEventListener('mouseenter', () => btn.style.opacity = '0.85');
  btn.addEventListener('mouseleave', () => btn.style.opacity = '1');
  document.body.appendChild(btn);
})();
