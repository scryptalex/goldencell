// Hero canvas animation: wandering cell morphs to gold and back
(function(){
  function lerp(a,b,t){ return a + (b-a)*t; }
  function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function createGoldCanvas(size){
    const c = document.createElement('canvas'); c.width=c.height=size;
    const ctx = c.getContext('2d');
    const r = size/2;
    const g = ctx.createRadialGradient(r*0.85,r*0.6,r*0.2, r*0.5,r*0.5,r);
    g.addColorStop(0, '#FFF3B0');
    g.addColorStop(0.35, '#FFD700');
    g.addColorStop(0.7, '#DAA520');
    g.addColorStop(1, '#B8860B');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(r, r, r*0.95, 0, Math.PI*2); ctx.fill();
    // subtle highlight
    ctx.globalAlpha = 0.25;
    ctx.beginPath(); ctx.ellipse(r*0.75, r*0.45, r*0.45, r*0.28, -0.5, 0, Math.PI*2); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.globalAlpha = 1;
    return c;
  }

  function start(){
    const host = document.querySelector('.hero-visual');
    if (!host) return;
    let canvas = document.getElementById('cell-canvas');
    if (!canvas){ canvas = document.createElement('canvas'); canvas.id='cell-canvas'; host.appendChild(canvas); }
    const ctx = canvas.getContext('2d');

    // configuration via data attributes with sensible defaults
    const ds = host.dataset || {};
    const baseSizeFactor = parseFloat(ds.cellSize || ds.cellSizeFactor) || 0.72;
    const chaos = parseFloat(ds.cellChaos) || 1; // 0.5 calm .. 2 wild
    const speed = parseFloat(ds.cellSpeed) || 1; // 0.5 slow .. 2 fast
    const rotateAmt = prefersReduced ? 0 : (0.0008 * speed);
    const accelMag = 0.02 * chaos;
    const maxVel = 0.8 * speed;
    const morphDuration = { min: 1800/ speed, max: 3200/ speed };

    function resize(){
      const rect = host.getBoundingClientRect();
      canvas.width = Math.max(300, Math.floor(rect.width));
      canvas.height = Math.max(220, Math.floor(rect.height));
    }
    resize();
    window.addEventListener('resize', resize);

    const cellImg = new Image();
    cellImg.src = 'generated-image.png';

    const goldImg = new Image();
    goldImg.src = 'assets/img/gold.png'; // optional override; falls back to gradient if not found

    let goldCanvas = null;
    let ready = false;
    let goldImgReady = false;
    cellImg.onload = () => { goldCanvas = createGoldCanvas(Math.min(canvas.width, canvas.height)); ready = true; };
    goldImg.onload = () => { goldImgReady = true; };

    // wandering entity
    const ent = {
      x: canvas.width*0.6,
      y: canvas.height*0.5,
      vx: 0.3*speed,
      vy: -0.2*speed,
      ang: 0,
      scale: 1,
      morph: 0, // 0 = cell, 1 = gold
      dir: 1,
      nextFlipAt: performance.now() + (Math.random()*(morphDuration.max-morphDuration.min)+morphDuration.min)
    };

    // sparkles shown near gold state
    const sparkles = [];
    function spawnSparkles(){
      // only spawn occasionally when gold is dominant
      if (ent.morph < 0.6) return;
      if (Math.random() > 0.2) return;
      for (let i=0;i<3;i++){
        sparkles.push({
          x: ent.x + (Math.random()-0.5)*60,
          y: ent.y + (Math.random()-0.5)*60,
          r: 1 + Math.random()*2,
          a: 0.8,
          life: 400 + Math.random()*600
        });
      }
    }

    let last = performance.now();
    function tick(now){
      const dt = Math.min(32, now - last); last = now;
      if (!ready){ requestAnimationFrame(tick); return; }

      // random acceleration for chaotic motion
      const ax = (Math.random()-0.5)*accelMag;
      const ay = (Math.random()-0.5)*accelMag;
      ent.vx = clamp(ent.vx + ax, -maxVel, maxVel);
      ent.vy = clamp(ent.vy + ay, -maxVel, maxVel);
      ent.x += ent.vx * dt;
      ent.y += ent.vy * dt;

      // bounce from edges with softness
      const pad = 40;
      if (ent.x < pad){ ent.x = pad; ent.vx *= -0.9; }
      if (ent.x > canvas.width-pad){ ent.x = canvas.width-pad; ent.vx *= -0.9; }
      if (ent.y < pad){ ent.y = pad; ent.vy *= -0.9; }
      if (ent.y > canvas.height-pad){ ent.y = canvas.height-pad; ent.vy *= -0.9; }

      // morph oscillation with random dwell durations
      if (now > ent.nextFlipAt){ ent.dir *= -1; ent.nextFlipAt = now + (Math.random()*(morphDuration.max-morphDuration.min)+morphDuration.min); }
      ent.morph = clamp(ent.morph + ent.dir * (dt/ (morphDuration.max)), 0, 1);

      // scale pulse tied to morph
      ent.scale = lerp(0.9, 1.18, 0.5 - 0.5*Math.cos(ent.morph*Math.PI));
      ent.ang += rotateAmt * dt;

      // draw
      ctx.clearRect(0,0,canvas.width,canvas.height);

      const size = Math.min(canvas.width, canvas.height) * baseSizeFactor * ent.scale;
      const w = size; const h = size;
      const x = ent.x - w/2; const y = ent.y - h/2;

      ctx.save();
      ctx.translate(ent.x, ent.y);
      ctx.rotate(ent.ang);
      ctx.translate(-ent.x, -ent.y);

      // merge effect: draw two converging ghosts during mid morph
      const mid = Math.abs(ent.morph-0.5)*2; // 1 at ends, 0 at center
      const offset = (1-mid) * 18;
      const drawImage = (img, alpha, ox, oy) => {
        ctx.globalAlpha = alpha;
        ctx.drawImage(img, x+ox, y+oy, w, h);
        ctx.globalAlpha = 1;
      };

      // Crossfade: cell -> gold
      // prepare gold canvas scaled to current size
      if (!goldCanvas || goldCanvas.width !== Math.floor(size)){ goldCanvas = createGoldCanvas(Math.max(32, Math.floor(size))); }

      // cell layers
      drawImage(cellImg, 1-ent.morph, -offset, 0);
      drawImage(cellImg, clamp(0.4*(1-ent.morph),0,1), offset, 0);
      // gold layers
      if (goldImgReady){ drawImage(goldImg, ent.morph, 0, 0); }
      else { drawImage(goldCanvas, ent.morph, 0, 0); }

      // glow for gold
      if (ent.morph > 0.6){
        const glow = ctx.createRadialGradient(ent.x, ent.y, size*0.2, ent.x, ent.y, size*0.75);
        glow.addColorStop(0, 'rgba(255,215,0,0.20)');
        glow.addColorStop(1, 'rgba(255,215,0,0.0)');
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(ent.x, ent.y, size*0.8, 0, Math.PI*2); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }

      // sparkles
      spawnSparkles();
      for (let i=sparkles.length-1; i>=0; i--){
        const s = sparkles[i];
        s.life -= dt; s.a *= 0.985; s.r *= 0.995; // fade
        if (s.life <= 0 || s.a < 0.02){ sparkles.splice(i,1); continue; }
        ctx.globalAlpha = s.a;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.restore();

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  document.addEventListener('DOMContentLoaded', start);
  window.addEventListener('gc:refresh', start);
})();
