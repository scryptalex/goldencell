(function(){
  const qs = (s,r=document)=>r.querySelector(s);
  const qsa = (s,r=document)=>Array.from(r.querySelectorAll(s));

  // Lightweight parallax for elements with [data-parallax]
  function initParallax(){
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const items = qsa('[data-parallax]');
    if (!items.length) return;
    let ticking = false;
    const speed = el => parseFloat(el.getAttribute('data-parallax')||'0.15') || 0;
    const update = () => {
      ticking = false;
      const y = window.scrollY || window.pageYOffset || 0;
      items.forEach(el => {
        const s = speed(el);
        el.style.transform = `translate3d(0, ${Math.round(y * s)}px, 0)`;
        el.style.willChange = 'transform';
      });
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }

  function initTabs(){
    qsa('[data-tabs]').forEach(root => {
      if (root.dataset.bound) return; root.dataset.bound='1';
      const tabs = qsa('[data-tab]', root);
      const panels = qsa('[data-panel]', root);
      function select(id){
        tabs.forEach(t=>{ const on=t.getAttribute('data-tab')===id; t.setAttribute('aria-selected', on?'true':'false'); });
        panels.forEach(p=>{ p.classList.toggle('active', p.getAttribute('data-panel')===id); });
      }
      tabs.forEach(t=>t.addEventListener('click', ()=> select(t.getAttribute('data-tab'))));
      if (tabs.length) select(tabs[0].getAttribute('data-tab'));
    });
  }

  function initAccordion(){
    qsa('[data-accordion]').forEach(root => {
      if (root.dataset.bound) return; root.dataset.bound='1';
      qsa('.acc-header', root).forEach(btn => {
        btn.addEventListener('click', ()=>{
          const expanded = btn.getAttribute('aria-expanded')==='true';
          btn.setAttribute('aria-expanded', expanded?'false':'true');
          const panel = btn.nextElementSibling; if (panel) panel.classList.toggle('open', !expanded);
        });
      });
    });
  }

  function initCarousel(){
    const root = qs('#product-carousel'); if (!root || root.dataset.bound) return; root.dataset.bound='1';
    const track = qs('.carousel-track', root); const slides = qsa('.carousel-slide', root);
    const prev = qs('.carousel-btn.prev', root); const next = qs('.carousel-btn.next', root);
    let index = 0; function clamp(i){ return (i+slides.length)%slides.length; }
    function update(){ const w = slides[0].getBoundingClientRect().width + 12; track.style.transform = `translateX(${-index*w}px)`; }
    function go(i){ index = clamp(i); update(); }
    prev && prev.addEventListener('click', ()=> go(index-1));
    next && next.addEventListener('click', ()=> go(index+1));
    window.addEventListener('resize', update);
    let timer = setInterval(()=> go(index+1), 4000);
    root.addEventListener('mouseenter', ()=> clearInterval(timer));
    root.addEventListener('mouseleave', ()=> timer = setInterval(()=> go(index+1), 4000));
    update();
  }

  function initLottie(){
    const el = qs('#lottie-hero'); if (!el || !window.lottie) return;
    try {
      window.lottie.loadAnimation({ container: el, renderer: 'svg', loop: true, autoplay: true, path: 'assets/lottie/cells.json' });
    } catch (_) { /* no-op */ }
  }

  async function initParticles(){
    const el = qs('#particles-hero'); if (!el || !window.tsParticles) return;
    try {
      await window.tsParticles.load({ id: 'particles-hero', options: {
        background: { color: { value: 'transparent' } },
        fpsLimit: 60,
        particles: {
          number: { value: 30, density: { enable: true, area: 800 } },
          color: { value: ['#FFD700','#DAA520','#FFA500'] },
          shape: { type: 'circle' },
          opacity: { value: 0.35 },
          size: { value: { min: 1, max: 3 } },
          move: { enable: true, speed: 0.8, direction: 'none', outModes: 'out' },
        },
        detectRetina: true,
      }});
    } catch (_) { /* no-op */ }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTabs(); initAccordion(); initCarousel(); initLottie(); initParticles(); initParallax();
  });
  window.addEventListener('gc:refresh', () => { try { initTabs(); initAccordion(); initCarousel(); initParallax(); } catch(_){ } });
})();
