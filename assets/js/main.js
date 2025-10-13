// Common site JS for Golden Cell
async function injectIncludes() {
  const targets = Array.from(document.querySelectorAll('[data-include]'));
  await Promise.all(targets.map(async (el) => {
    const url = el.getAttribute('data-include');
    if (!url) return;
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return;
      const html = await res.text();
      el.outerHTML = html; // replace placeholder with fetched markup
    } catch (_) { /* noop */ }
  }));
}

function setYear() {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
}

function highlightActiveNav() {
  const path = (() => {
    const p = (location.pathname || '').split('/').pop();
    return p && p.length ? p : 'index.html';
  })();
  document.querySelectorAll('.nav a').forEach((a) => {
    const href = a.getAttribute('href') || '';
    const base = href.split('#')[0];
    if (base && base === path) a.classList.add('active');
  });
}

function getHeaderHeight() {
  const h = document.querySelector('.site-header');
  if (!h) return 0;
  const r = h.getBoundingClientRect();
  return Math.max(r.height, h.offsetHeight || 0);
}

function smoothScrollTo(targetEl) {
  if (!targetEl) return;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const headerOffset = getHeaderHeight() + 6; // small breathing room
  const rect = targetEl.getBoundingClientRect();
  const absoluteY = rect.top + (window.pageYOffset || window.scrollY || 0);
  const to = Math.max(absoluteY - headerOffset, 0);
  if (reduce) {
    window.scrollTo(0, to);
    return;
  }
  try {
    window.scrollTo({ top: to, behavior: 'smooth' });
  } catch (_) {
    // Fallback animation
    const start = (window.pageYOffset || window.scrollY || 0);
    const dist = to - start;
    const dur = Math.min(900, Math.max(350, Math.abs(dist) * 0.5));
    let t0;
    function step(ts) {
      if (!t0) t0 = ts;
      const p = Math.min(1, (ts - t0) / dur);
      const e = p < 0.5 ? 2*p*p : -1 + (4 - 2*p) * p; // easeInOutQuad
      window.scrollTo(0, start + dist * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
}

function bindSmoothScroll() {
  if (document.body.dataset.smoothBound) return; // bind once
  document.body.dataset.smoothBound = '1';
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href) return;
    // Same-page fragment like "#section" or "index.html#section"
    const [base, hash] = href.split('#');
    if (!hash) return; // no fragment
    const current = (location.pathname || '').split('/').pop() || 'index.html';
    if (base && base.length && base !== current) return; // different page; allow default nav
    const target = document.getElementById(hash);
    if (!target) return;
    e.preventDefault();
    // Close mobile nav if open
    const header = document.querySelector('.site-header');
    const btn = header && header.querySelector('.menu-toggle');
    const nav = header && header.querySelector('.nav');
    if (btn && nav) { btn.classList.remove('open'); nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    smoothScrollTo(target);
  }, { passive: false });
}

// Mobile menu toggle (call after header is injected)
function bindMenu() {
  const h = document.querySelector('.site-header');
  if (!h || h.dataset.menuBound) return;
  const btn = h.querySelector('.menu-toggle');
  const nav = h.querySelector('.nav');
  if (!btn || !nav) return;
  h.dataset.menuBound = '1';
  const close = () => { btn.classList.remove('open'); nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); };
  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  window.addEventListener('resize', () => { if (window.innerWidth > 900) close(); }, { passive: true });
}

document.addEventListener('DOMContentLoaded', async () => {
  await injectIncludes();
  setYear();
  highlightActiveNav();
  // Let i18n re-apply translations and bind listeners now that header is present
  window.dispatchEvent(new Event('gc:refresh'));

  // Header scroll state for elevated look on light theme
  const header = document.querySelector('.site-header');
  const apply = () => { if (!header) return; header.classList.toggle('scrolled', window.scrollY > 2); };
  apply();
  window.addEventListener('scroll', apply, { passive: true });
  bindMenu();
  bindSmoothScroll();

  // If page loaded with a hash, align with header offset
  if (location.hash) {
    const el = document.getElementById(location.hash.slice(1));
    if (el) setTimeout(() => smoothScrollTo(el), 0);
  }
});

// Re-bind menu after includes refresh
window.addEventListener('gc:refresh', () => {
  try {
    const h = document.querySelector('.site-header');
    if (h) h.dataset.menuBound = '';
    bindMenu();
    bindSmoothScroll();
  } catch (_) { /* noop */ }
});
