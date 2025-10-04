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

document.addEventListener('DOMContentLoaded', async () => {
  await injectIncludes();
  setYear();
  highlightActiveNav();
  // Let i18n re-apply translations and bind listeners now that header is present
  window.dispatchEvent(new Event('gc:refresh'));
});
