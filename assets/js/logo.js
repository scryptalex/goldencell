(function(){
  function init(){
    const c = document.getElementById('logo-sphere');
    if (!c) return;
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    function resize(){
      const box = c.getBoundingClientRect();
      c.width = Math.floor(box.width * dpr);
      c.height = Math.floor(box.height * dpr);
    }
    resize();
    window.addEventListener('resize', resize);
    const ctx = c.getContext('2d');

    // Colors from CSS variables
    const styles = getComputedStyle(document.documentElement);
    const goldA = styles.getPropertyValue('--gold-500').trim() || '#b3891f';
    const goldB = styles.getPropertyValue('--gold-600').trim() || '#8b6b16';
    const oceanA = '#9bc9e3';
    const oceanB = '#6db6d8';

    const R = () => Math.min(c.width, c.height) * 0.48;
    const center = () => ({ x: c.width/2, y: c.height/2 });

    // Generate molecular nodes on a sphere
    const N = 90; // nodes
    const nodes = new Array(N).fill(0).map((_,i)=>{
      const u = Math.random();
      const v = Math.random();
      // Fibonacci-ish random sphere points
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2*v - 1);
      return { theta, phi, phase: Math.random()*Math.PI*2 };
    });

    // Precompute neighbor indices (k nearest in param space)
    const K = 2;
    const nbrs = nodes.map((n,i)=>{
      const arr = nodes.map((m,j)=>({ j, d: Math.hypot(n.theta-m.theta, n.phi-m.phi) })).sort((a,b)=>a.d-b.d);
      return arr.slice(1,K+1).map(e=>e.j);
    });

    let last = performance.now();
    let rotOcean = 0;
    let rotMol = 0;
    const speed = 0.00012; // globe spin
    const speedMol = -0.00018; // molecules opposite

    function sphTo3D(phi, theta){
      const x = Math.sin(phi)*Math.cos(theta);
      const y = Math.cos(phi);
      const z = Math.sin(phi)*Math.sin(theta);
      return {x,y,z};
    }
    function rotY(p, a){
      const ca = Math.cos(a), sa = Math.sin(a);
      return { x: ca*p.x + sa*p.z, y: p.y, z: -sa*p.x + ca*p.z };
    }
    function project(p, r){ return { x: p.x*r, y: p.y*r, z: p.z }; }

    function draw(now){
      const dt = Math.min(34, now - last); last = now;
      rotOcean += speed * dt;
      rotMol += speedMol * dt;
      const {x:cx,y:cy} = center();
      const r = R();

      ctx.clearRect(0,0,c.width,c.height);
      ctx.save();
      ctx.translate(cx, cy);

      // Clip circle
      ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.clip();

      // Ocean gradient base
      const g = ctx.createRadialGradient(-r*0.3, -r*0.3, r*0.2, 0, 0, r);
      g.addColorStop(0, oceanA);
      g.addColorStop(1, oceanB);
      ctx.fillStyle = g; ctx.fillRect(-r, -r, r*2, r*2);

      // Sphere shading (vignette)
      const shade = ctx.createRadialGradient(-r*0.3, -r*0.3, r*0.4, 0, 0, r);
      shade.addColorStop(0, 'rgba(255,255,255,0.35)');
      shade.addColorStop(0.6, 'rgba(0,0,0,0)');
      shade.addColorStop(1, 'rgba(0,0,0,0.25)');
      ctx.fillStyle = shade; ctx.fillRect(-r, -r, r*2, r*2);

      // Molecular network (front hemisphere only)
      const pts = nodes.map((n,i)=>{
        const wobPhi = n.phi + 0.04*Math.sin(now*0.003 + n.phase);
        const wobThe = n.theta + 0.04*Math.cos(now*0.002 + n.phase*1.3);
        let p = sphTo3D(wobPhi, wobThe);
        p = rotY(p, rotMol);
        return project(p, r);
      });

      // Connections
      ctx.lineWidth = Math.max(1, r*0.01);
      for (let i=0;i<N;i++){
        const a = pts[i]; if (a.z < 0) continue; // backface cull
        nbrs[i].forEach(j=>{
          const b = pts[j]; if (b.z < 0) return;
          const depth = (a.z + b.z) * 0.5; // -1..1
          const w = 0.6 + 0.6*(depth*0.5+0.5);
          ctx.strokeStyle = `rgba( ${hexToRgb(goldA)}, ${w} )`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        });
      }

      // Nodes
      for (let i=0;i<N;i++){
        const p = pts[i]; if (p.z < 0) continue;
        const rr = Math.max(1, r*0.018 * (p.z*0.5+0.7));
        const gg = ctx.createRadialGradient(p.x-rr*0.4, p.y-rr*0.4, rr*0.2, p.x, p.y, rr);
        gg.addColorStop(0, goldA);
        gg.addColorStop(1, goldB);
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, Math.PI*2); ctx.fill();
      }

      ctx.restore();
      requestAnimationFrame(draw);
    }

    function hexToRgb(hex){
      const h = hex.replace('#','');
      const bigint = parseInt(h, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `${r}, ${g}, ${b}`;
    }

    requestAnimationFrame(draw);
  }

  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('gc:refresh', init);
})();

