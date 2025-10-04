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
    const cut = clamp(parseFloat(ds.cellCut || ds.cellCutout || ds.cellCenterCut) || 0.42, 0.2, 0.7); // central square cut-out factor
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

    // Use images provided under /images; pick randomly at load
    const cellSources = [
      'images/20251005_0201_Golden Molecular Structure_remix_01k6rq8f5nfb5tcdv9dc5qmctk.png',
      'images/20251005_0202_Clear Molecular Pattern_remix_01k6rq963nep6tcw06sfyy3evb.png',
      'images/20251005_0202_Clear Molecular Pattern_remix_01k6rq963ped7beksp03r70d5k.png'
    ];
    const cellImg = new Image();
    cellImg.src = cellSources[Math.floor(Math.random()*cellSources.length)];

    const goldImg = new Image();
    goldImg.src = 'assets/img/gold.png'; // optional override; falls back to gradient if not found

    let goldCanvas = null;
    const maskedCache = new Map();
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
    let lastX = ent.x, lastY = ent.y;

    // trail particles
    const trail = [];
    function pushTrail(){
      const dx = ent.x - lastX, dy = ent.y - lastY;
      const dist = Math.hypot(dx,dy);
      if (dist > 4){
        trail.push({ x: ent.x, y: ent.y, a: 0.22, r: 2 + Math.random()*2 });
        if (trail.length > 60) trail.shift();
        lastX = ent.x; lastY = ent.y;
      }
    }

    // orbiters
    const orbits = Array.from({length: 6}, (_,i)=>({ ang: Math.random()*Math.PI*2, r: 28 + i*6, sp: 0.0015*(i+1)*speed }));

    // central mask builder (cuts out a centered square)
    function getMasked(size){
      const key = Math.floor(size);
      if (maskedCache.has(key)) return maskedCache.get(key);
      const c = document.createElement('canvas'); c.width=c.height=key;
      const cx = c.getContext('2d');
      // draw scaled cell image
      cx.drawImage(cellImg, 0, 0, key, key);
      // cut out central square
      const s = key * cut;
      const x = (key - s)/2, y = (key - s)/2;
      cx.save();
      cx.globalCompositeOperation = 'destination-out';
      const rad = Math.max(6, key*0.02);
      // rounded square path
      cx.beginPath();
      cx.moveTo(x+rad, y);
      cx.lineTo(x+s-rad, y); cx.quadraticCurveTo(x+s, y, x+s, y+rad);
      cx.lineTo(x+s, y+s-rad); cx.quadraticCurveTo(x+s, y+s, x+s-rad, y+s);
      cx.lineTo(x+rad, y+s); cx.quadraticCurveTo(x, y+s, x, y+s-rad);
      cx.lineTo(x, y+rad); cx.quadraticCurveTo(x, y, x+rad, y);
      cx.closePath(); cx.fill();
      cx.restore();
      maskedCache.set(key, c);
      return c;
    }
    // ripple rings on morph flips
    const ripples = [];

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
      if (now > ent.nextFlipAt){
        ent.dir *= -1;
        ent.nextFlipAt = now + (Math.random()*(morphDuration.max-morphDuration.min)+morphDuration.min);
        // spawn ripple at current entity position
        ripples.push({ x: ent.x, y: ent.y, r: Math.max(16, Math.min(canvas.width, canvas.height)*0.12), a: 0.25, v: 0.12 });
      }
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
      // membrane wobble (non-uniform scale)
      if (!prefersReduced){
        const wob = 0.03;
        const sx = 1 + wob * Math.sin(now*0.002 + 0.3);
        const sy = 1 - wob * Math.sin(now*0.002 - 0.2);
        ctx.scale(sx, sy);
      }
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

      // cell layers (masked center)
      const masked = getMasked(Math.max(32, Math.floor(size)));
      drawImage(masked, 1-ent.morph, -offset, 0);
      drawImage(masked, clamp(0.4*(1-ent.morph),0,1), offset, 0);
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

      // subtle tint pulse (golden wash)
      if (!prefersReduced){
        const ta = 0.05 + 0.05*Math.sin(now*0.003);
        ctx.globalAlpha = ta;
        const wash = ctx.createRadialGradient(ent.x, ent.y, size*0.3, ent.x, ent.y, size*0.9);
        wash.addColorStop(0, 'rgba(255,215,0,0.5)');
        wash.addColorStop(1, 'rgba(218,165,32,0.0)');
        ctx.fillStyle = wash; ctx.beginPath(); ctx.arc(ent.x, ent.y, size*0.95, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1;
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

      // ripples (expanding rings)
      for (let i=ripples.length-1; i>=0; i--){
        const rp = ripples[i];
        rp.r += rp.v * dt * (size*0.02);
        rp.a *= 0.985;
        if (rp.a < 0.02 || rp.r > Math.max(canvas.width, canvas.height)) { ripples.splice(i,1); continue; }
        ctx.globalAlpha = rp.a;
        ctx.strokeStyle = 'rgba(255,215,0,0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI*2); ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // trail
      pushTrail();
      for (let i=0;i<trail.length;i++){
        const t = trail[i];
        t.a *= 0.98; t.r *= 0.995;
        if (t.a < 0.02) { trail.splice(i,1); i--; continue; }
        ctx.globalAlpha = t.a;
        ctx.fillStyle = 'rgba(218,165,32,0.6)';
        ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1;
      }

      // orbits (micro vesicles)
      if (!prefersReduced){
        ctx.globalAlpha = 0.9;
        orbits.forEach((o,idx)=>{
          o.ang += o.sp * dt;
          const px = ent.x + Math.cos(o.ang) * (o.r + size*0.02);
          const py = ent.y + Math.sin(o.ang) * (o.r + size*0.02);
          ctx.fillStyle = idx%2? '#FFD700' : '#DAA520';
          ctx.beginPath(); ctx.arc(px, py, 2 + (idx%3===0?1:0), 0, Math.PI*2); ctx.fill();
        });
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
