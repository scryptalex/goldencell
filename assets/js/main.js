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
});

// Re-bind menu after includes refresh
window.addEventListener('gc:refresh', () => {
  try {
    const h = document.querySelector('.site-header');
    if (h) h.dataset.menuBound = '';
    bindMenu();
  } catch (_) { /* noop */ }
});
