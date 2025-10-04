// Common site JS for Golden Cell
document.addEventListener('DOMContentLoaded', () => {
  // Set current year in footer
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Highlight active nav link based on current file name
  const path = (() => {
    const p = (location.pathname || '').split('/').pop();
    return p && p.length ? p : 'index.html';
  })();
  document.querySelectorAll('.nav a').forEach((a) => {
    try {
      const href = a.getAttribute('href') || '';
      const base = href.split('#')[0];
      if (base && base === path) a.classList.add('active');
    } catch (_) { /* noop */ }
  });
});

