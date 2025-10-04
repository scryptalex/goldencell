// Perplexity-derived interactions: charts and minor visuals
(function(){
  function qs(sel,root=document){ return root.querySelector(sel); }
  function qsa(sel,root=document){ return Array.from(root.querySelectorAll(sel)); }

  function smoothScroll(){
    qsa('.nav a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const tgt = qs(href);
          if (tgt) tgt.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // close mobile menu
          const nav = qs('.nav');
          const btn = qs('.menu-toggle');
          if (nav) nav.classList.remove('open');
          if (btn) btn.classList.remove('open');
          if (btn) btn.setAttribute('aria-expanded','false');
        }
      });
    });
  }

  function menuToggle(){
    const btn = qs('.menu-toggle');
    const nav = qs('.nav');
    if (!btn || !nav || btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function reveals(){
    const els = qsa('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    els.forEach(el => io.observe(el));
  }

  function counters(){
    const els = qsa('[data-count]');
    if (!els.length) return;
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const el = e.target;
        const end = parseFloat(el.getAttribute('data-count'))||0;
        const suffix = el.getAttribute('data-suffix')||'';
        const dur = 1000;
        const start = performance.now();
        const from = 0;
        function tick(now){
          const t = Math.min(1, (now-start)/dur);
          const val = Math.floor(from + (end-from)*t);
          el.textContent = val.toString() + suffix;
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    els.forEach(el => io.observe(el));
  }

  function parallax(){ /* replaced by cell morph canvas; keeping no-op for compatibility */ }

  function tilt(){
    qsa('.product, .tile, .card').forEach(el => {
      let raf = 0;
      function onMove(e){
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left)/r.width - 0.5;
        const y = (e.clientY - r.top)/r.height - 0.5;
        const rx = (-y * 6).toFixed(2);
        const ry = (x * 8).toFixed(2);
        el.style.setProperty('--rx', rx+'deg');
        el.style.setProperty('--ry', ry+'deg');
        if (!raf) raf = requestAnimationFrame(()=>{ el.classList.add('tilt'); raf=0; });
      }
      function reset(){ el.classList.remove('tilt'); el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); }
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', reset);
    });
  }

  function initCharts(){
    var gm = document.getElementById('globalMarketChart');
    var cm = document.getElementById('cancerMarketChart');
    if (gm && window.Chart){
      new Chart(gm.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['NA', 'EU', 'APAC', 'LATAM'],
          datasets: [{
            label: 'Biopharma Market (B$)',
            data: [180, 160, 220, 40],
            backgroundColor: ['#FFD700', '#FFA500', '#B8860B', '#E6B800'],
            borderColor: ['#B8860B', '#DAA520', '#8B6C0E', '#B8860B'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(0,0,0,0.8)',
              titleColor: '#FFD700',
              bodyColor: '#fff'
            }
          },
          scales: {
            y: { beginAtZero: true, ticks: { color: '#5D4E37' } },
            x: { ticks: { color: '#5D4E37' } }
          }
        }
      });
    }
    if (cm && window.Chart){
      new Chart(cm.getContext('2d'), {
        type: 'line',
        data: {
          labels: ['2021','2022','2023','2024','2025','2026'],
          datasets: [{
            label: 'Oncology Market Growth',
            data: [100,110,123,139,158,180],
            borderColor: '#DAA520',
            backgroundColor: 'rgba(255, 215, 0, 0.25)',
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(0,0,0,0.8)',
              titleColor: '#FFD700',
              bodyColor: '#fff'
            }
          },
          scales: {
            y: { beginAtZero: false, ticks: { color: '#5D4E37' } },
            x: { ticks: { color: '#5D4E37' } }
          }
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', initCharts);
  document.addEventListener('DOMContentLoaded', () => {
    smoothScroll();
    menuToggle();
    reveals();
    counters();
    parallax();
    tilt();
  });

  // Re-bind after header/footer includes injected
  window.addEventListener('gc:refresh', () => {
    try { smoothScroll(); menuToggle(); } catch(_){ }
  });
})();
