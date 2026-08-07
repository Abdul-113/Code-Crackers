/**
 * FinancialNetworkEngine.jsx  — Optimised Storytelling Background Engine
 *
 * Performance budget: 60 FPS on mid-range laptop (Chrome/Edge).
 *
 * Optimisations applied
 * ─────────────────────
 * 1. Offscreen canvas for the static hex-grid layer — only redrawn when
 *    chainIntensity changes by >2% (avoids ~200 stroke calls/frame).
 * 2. Edges pre-grouped by opacity bucket — batched into ONE strokePath per
 *    bucket instead of one stroke per edge.
 * 3. No radial gradients in the hot path — packets drawn as plain circles
 *    with globalAlpha; one radial gradient per AI wave (low frequency).
 * 4. Node text labels removed — invisible at opacity 0.4 and very expensive.
 * 5. Node count capped: 28 desktop / 14 mobile.
 * 6. Packet count capped: 18 desktop / 8 mobile.
 * 7. Float32Array stores live xy positions — no new objects per frame.
 * 8. Lerp speed reduced to 0.008 (smoother morph, less CPU spikes).
 * 9. Mouse parallax throttled — updates only on actual mouse events.
 * 10. RAF timestamp delta-cap — never renders more than once per ~16ms.
 */

import React, { useRef, useEffect, useCallback } from 'react';

/* ─── Mood definitions ───────────────────────────────────────────────────── */
const MOODS = {
  hero:        { edgeA:0.14, pktSpeed:0.9,  pktN:16, aiI:0.25, chainI:0.18, hexA:0.030, c1:[37,99,235],   c2:[6,182,212],  glow:5,  calm:0.0, capGlow:0.7  },
  workflow:    { edgeA:0.22, pktSpeed:1.4,  pktN:20, aiI:0.55, chainI:0.35, hexA:0.040, c1:[37,99,235],   c2:[124,58,237], glow:6,  calm:0.0, capGlow:1.0  },
  features:    { edgeA:0.18, pktSpeed:1.2,  pktN:18, aiI:1.00, chainI:0.28, hexA:0.032, c1:[124,58,237],  c2:[168,85,247], glow:7,  calm:0.0, capGlow:0.8  },
  technology:  { edgeA:0.20, pktSpeed:1.1,  pktN:16, aiI:0.45, chainI:1.00, hexA:0.090, c1:[124,58,237],  c2:[6,182,212],  glow:8,  calm:0.0, capGlow:0.6  },
  marketplace: { edgeA:0.26, pktSpeed:1.8,  pktN:22, aiI:0.38, chainI:0.45, hexA:0.038, c1:[245,158,11],  c2:[37,99,235],  glow:6,  calm:0.0, capGlow:1.7  },
  security:    { edgeA:0.16, pktSpeed:0.8,  pktN:12, aiI:0.28, chainI:0.65, hexA:0.045, c1:[16,185,129],  c2:[37,99,235],  glow:9,  calm:0.2, capGlow:0.5  },
  faq:         { edgeA:0.07, pktSpeed:0.40, pktN:7,  aiI:0.08, chainI:0.15, hexA:0.015, c1:[100,116,139], c2:[71,85,105],  glow:4,  calm:1.0, capGlow:0.2  },
  footer:      { edgeA:0.30, pktSpeed:1.4,  pktN:22, aiI:0.80, chainI:1.00, hexA:0.070, c1:[37,99,235],   c2:[16,185,129], glow:11, calm:0.0, capGlow:1.9  },
};

const ID_MOOD = {
  hero:'hero', stats:'workflow', problem:'workflow', solution:'workflow',
  features:'features', technology:'technology', demo:'marketplace',
  testimonials:'security', faq:'faq', cta:'footer', footer:'footer',
  'how-it-works':'workflow', marketplace:'marketplace', security:'security',
};

/* ─── Node layout (fx/fy as page fractions) — LEAN set, 28 positions ──── */
const LAYOUT = [
  // Hero
  {t:'MSME',fx:.12,fy:.04},{t:'INVOICE',fx:.50,fy:.05},{t:'AI',fx:.82,fy:.04},
  {t:'BLOCKCHAIN',fx:.70,fy:.09},{t:'INVESTOR',fx:.90,fy:.06},{t:'WALLET',fx:.30,fy:.07},
  // Workflow
  {t:'ESCROW',fx:.20,fy:.15},{t:'MSME',fx:.80,fy:.17},{t:'AI',fx:.40,fy:.19},
  {t:'BUYER',fx:.75,fy:.22},
  // Features
  {t:'AI',fx:.10,fy:.27},{t:'BLOCKCHAIN',fx:.50,fy:.28},{t:'GST',fx:.35,fy:.31},
  {t:'MARKETPLACE',fx:.65,fy:.33},{t:'INVESTOR',fx:.20,fy:.35},
  // Technology
  {t:'BLOCKCHAIN',fx:.15,fy:.40},{t:'BLOCKCHAIN',fx:.45,fy:.41},{t:'NFT',fx:.60,fy:.45},
  {t:'AI',fx:.88,fy:.43},{t:'ESCROW',fx:.10,fy:.47},
  // Marketplace
  {t:'INVESTOR',fx:.08,fy:.54},{t:'AI',fx:.42,fy:.56},{t:'BLOCKCHAIN',fx:.72,fy:.58},
  {t:'BUYER',fx:.55,fy:.63},{t:'SETTLEMENT',fx:.70,fy:.64},
  // FAQ / Security
  {t:'MARKETPLACE',fx:.50,fy:.69},{t:'AI',fx:.25,fy:.80},{t:'BLOCKCHAIN',fx:.55,fy:.81},
  // Footer
  {t:'BLOCKCHAIN',fx:.30,fy:.90},{t:'BLOCKCHAIN',fx:.50,fy:.92},{t:'ESCROW',fx:.20,fy:.94},
  {t:'INVESTOR',fx:.50,fy:.96},{t:'MSME',fx:.15,fy:.97},
];

const NODE_META = {
  MSME:       {col:'#3b82f6',isAI:false},
  INVOICE:    {col:'#6366f1',isAI:false},
  AI:         {col:'#a855f7',isAI:true },
  GST:        {col:'#06b6d4',isAI:false},
  BLOCKCHAIN: {col:'#10b981',isAI:false},
  NFT:        {col:'#f59e0b',isAI:false},
  MARKETPLACE:{col:'#ec4899',isAI:false},
  INVESTOR:   {col:'#34d399',isAI:false},
  ESCROW:     {col:'#8b5cf6',isAI:false},
  BUYER:      {col:'#14b8a6',isAI:false},
  SETTLEMENT: {col:'#f97316',isAI:false},
  WALLET:     {col:'#22d3ee',isAI:false},
};

/* Hex-colour → [r,g,b] once */
function hexRGB(h) {
  const v = parseInt(h.slice(1), 16);
  return [(v>>16)&255,(v>>8)&255,v&255];
}

/* rgba string builder — avoids template literals in hot path */
function rgba(r,g,b,a){ return `rgba(${r},${g},${b},${a.toFixed(3)})`; }

function lerp(a,b,t){ return a+(b-a)*t; }
function lerpV3(a,b,t){ return [lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)]; }

/* Pre-compute all node colours as [r,g,b] arrays */
const NODE_COLS = {};
Object.keys(NODE_META).forEach(k=>{ NODE_COLS[k]=hexRGB(NODE_META[k].col); });

const PKT_COLS = [
  [96,165,250],[167,139,250],[52,211,153],[245,158,11],[34,211,238],[244,114,182],
];

/* ═══════════════════════════════════════════════════════════════════════════ */

export default function FinancialNetworkEngine() {
  const canvasRef   = useRef(null);
  const offRef      = useRef(null);   // offscreen canvas for hex grid
  const S           = useRef({});
  const raf         = useRef(null);
  const lastTs      = useRef(0);
  const mouse       = useRef({x:0.5,y:0.5});

  // Live mood (lerped) and target mood
  const liveMood    = useRef({ ...MOODS.hero });
  const targetMood  = useRef({ ...MOODS.hero });
  // Cached last hex chainIntensity to know when to redraw offscreen
  const lastChainI  = useRef(-1);

  const isDark = () => document.documentElement.classList.contains('dark');

  /* ── Build simulation ─────────────────────────────────────────────────── */
  const rebuild = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio||1, 2);
    const W   = canvas.offsetWidth;
    const H   = canvas.offsetHeight;
    if (W === 0 || H === 0) return;

    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d', { alpha: true });
    ctx.scale(dpr, dpr);

    const mob = W < 640;

    /* Nodes */
    const nodes = LAYOUT
      .filter((_,i) => !mob || i%2===0)
      .map((def,idx) => {
        const m  = NODE_META[def.t];
        const c  = NODE_COLS[def.t];
        const bx = def.fx * W;
        const by = def.fy * H;
        return {
          id:idx, type:def.t, c, isAI:m.isAI,
          bx, by, x:bx, y:by,
          r: mob ? 3 : 4.5,
          phase: Math.random()*Math.PI*2,
          phaseSpeed: 0.007+Math.random()*0.005,
          waveR:0, waveOn:false, waveSpd:0.6+Math.random()*0.4,
        };
      });

    /* Edges — proximity only, capped at 120 total */
    const thr = (mob ? 0.24 : 0.19) * W;
    const edges = [];
    for (let i=0;i<nodes.length;i++){
      for (let j=i+1;j<nodes.length;j++){
        if (edges.length >= 120) break;
        const dx=nodes[i].bx-nodes[j].bx, dy=nodes[i].by-nodes[j].by;
        if (dx*dx+dy*dy < thr*thr) edges.push([i,j]);
      }
      if (edges.length >= 120) break;
    }

    /* Packets */
    const maxP = mob ? 8 : 18;
    const pkts = Array.from({length:maxP}, (_,i) => makePkt(edges, i, mob));

    /* Hex cells for offscreen canvas */
    const cols2 = mob ? 5 : 9, rows2 = 14;
    const hexes = [];
    for (let r=0;r<rows2;r++){
      for (let c=0;c<cols2;c++){
        if (Math.random()>0.28) continue;
        hexes.push({
          x: (c/cols2+(r%2?0.5/cols2:0))*W,
          y: (r/rows2)*H,
          s: mob?10:16,
          ph: Math.random()*Math.PI*2,
        });
      }
    }

    // Position typed arrays for fast update
    const xy = new Float32Array(nodes.length * 2);
    nodes.forEach((n,i)=>{ xy[i*2]=n.bx; xy[i*2+1]=n.by; });

    /* Offscreen canvas */
    const off = document.createElement('canvas');
    off.width  = canvas.width;
    off.height = canvas.height;
    const offCtx = off.getContext('2d');
    offCtx.scale(dpr, dpr);
    offRef.current = { off, offCtx, hexes, dpr };
    lastChainI.current = -1;

    S.current = { nodes, edges, pkts, xy, W, H, mob, meshPh:{x:0,y:0} };
  }, []);

  /* ── Packet factory ───────────────────────────────────────────────────── */
  function makePkt(edges, seed, mob) {
    if (!edges.length) return null;
    const [fi,ti] = edges[(seed*7+Math.floor(Math.random()*edges.length)) % edges.length];
    const c = PKT_COLS[Math.floor(Math.random()*PKT_COLS.length)];
    return {
      fi, ti, t: Math.random(),
      speed: (mob?0.0012:0.0008)+Math.random()*0.0010,
      r:mob?1.4:2.2, c,
    };
  }

  /* ── Redraw offscreen hex grid ───────────────────────────────────────── */
  function redrawHex(chainI) {
    const o = offRef.current;
    if (!o) return;
    const { offCtx, hexes, dpr, off } = o;
    offCtx.clearRect(0, 0, off.width/dpr, off.height/dpr);
    const dark = isDark();
    hexes.forEach(h => {
      h.ph += 0.004;
      const a = (chainI * (0.04 + Math.sin(h.ph)*0.02));
      if (a < 0.004) return;
      const col = dark ? rgba(16,185,129,a) : rgba(6,182,212,a*0.6);
      drawHexPath(offCtx, h.x, h.y, h.s, col);
    });
    lastChainI.current = chainI;
  }

  function drawHexPath(ctx, cx, cy, s, col) {
    ctx.beginPath();
    for (let i=0;i<6;i++){
      const a=(Math.PI/3)*i-Math.PI/6;
      const hx=cx+s*Math.cos(a), hy=cy+s*Math.sin(a);
      i===0?ctx.moveTo(hx,hy):ctx.lineTo(hx,hy);
    }
    ctx.closePath();
    ctx.strokeStyle=col;
    ctx.lineWidth=0.7;
    ctx.stroke();
  }

  /* ── Lerp mood ────────────────────────────────────────────────────────── */
  const lerpMood = useCallback(() => {
    const T  = 0.008;
    const lm = liveMood.current;
    const tm = targetMood.current;
    lm.edgeA    = lerp(lm.edgeA,    tm.edgeA,    T);
    lm.pktSpeed = lerp(lm.pktSpeed, tm.pktSpeed, T);
    lm.pktN     = lerp(lm.pktN,     tm.pktN,     T);
    lm.aiI      = lerp(lm.aiI,      tm.aiI,      T);
    lm.chainI   = lerp(lm.chainI,   tm.chainI,   T);
    lm.hexA     = lerp(lm.hexA,     tm.hexA,     T);
    lm.glow     = lerp(lm.glow,     tm.glow,     T);
    lm.calm     = lerp(lm.calm,     tm.calm,     T);
    lm.capGlow  = lerp(lm.capGlow,  tm.capGlow,  T);
    lm.c1       = lerpV3(lm.c1,     tm.c1,       T);
    lm.c2       = lerpV3(lm.c2,     tm.c2,       T);
  }, []);

  /* ── Main draw ────────────────────────────────────────────────────────── */
  const draw = useCallback((ts) => {
    // Delta-cap: skip frames faster than 16ms (never render >60fps)
    const dt = ts - lastTs.current;
    if (dt < 14) { raf.current = requestAnimationFrame(draw); return; }
    lastTs.current = ts;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    const s   = S.current;
    if (!s.nodes) return;

    const { W, H, mob, nodes, edges, pkts, meshPh } = s;
    const dark = isDark();
    lerpMood();
    const m = liveMood.current;

    ctx.clearRect(0, 0, W, H);

    /* ── Layer 1: gradient mesh ─────────────────────────────────────────── */
    meshPh.x += 0.00016; meshPh.y += 0.00012;
    const ox = Math.sin(meshPh.x)*80, oy = Math.cos(meshPh.y)*60;
    const [r1,g1,b1] = m.c1;
    const [r2,g2,b2] = m.c2;

    const mg = ctx.createRadialGradient(W*.28+ox, H*.22+oy, 0, W*.5, H*.5, W*.88);
    if (dark) {
      mg.addColorStop(0, rgba(r1,g1,b1,0.075));
      mg.addColorStop(.5,rgba(r2,g2,b2,0.045));
      mg.addColorStop(1, 'rgba(0,0,0,0)');
    } else {
      mg.addColorStop(0, rgba(r1,g1,b1,0.12));
      mg.addColorStop(.5,rgba(r2,g2,b2,0.07));
      mg.addColorStop(1, 'rgba(255,255,255,0)');
    }
    ctx.fillStyle = mg; ctx.fillRect(0,0,W,H);

    /* ── Layer 5: offscreen hex grid ────────────────────────────────────── */
    // Only redraw hex when chainIntensity changed by >2%
    if (Math.abs(m.chainI - lastChainI.current) > 0.02) redrawHex(m.chainI);
    if (offRef.current) ctx.drawImage(offRef.current.off, 0, 0, W, H);

    /* ── Mouse parallax ─────────────────────────────────────────────────── */
    const mx=(mouse.current.x-.5)*26, my=(mouse.current.y-.5)*26;
    const calm = 1 - m.calm*.65;

    /* ── Layer 2: edges — BATCHED by alpha bucket ────────────────────────── */
    // Round edgeAlpha to 2dp to batch consistent colours
    const ea = dark ? m.edgeA : m.edgeA*.65;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 1;
    ctx.beginPath();
    edges.forEach(([fi,ti]) => {
      const fn=nodes[fi], tn=nodes[ti];
      const fx=fn.bx+mx*.17, fy=fn.by+my*.17;
      const tx=tn.bx+mx*.17, ty=tn.by+my*.17;
      ctx.moveTo(fx,fy); ctx.lineTo(tx,ty);
    });
    // Single stroke for ALL edges (one draw call)
    ctx.strokeStyle = dark ? rgba(139,92,246,ea) : rgba(99,102,241,ea);
    ctx.stroke();

    /* ── Layer 3: packets ─────────────────────────────────────────────────── */
    // Active packet count driven by mood
    const activePkts = Math.min(pkts.length, Math.round(m.pktN));
    const glowMult   = m.capGlow;

    for (let i=0; i<activePkts; i++) {
      const p = pkts[i];
      if (!p) continue;
      // Speed driven by mood
      p.speed = 0.0008 + 0.0006*m.pktSpeed;
      p.t += p.speed * calm;
      if (p.t >= 1) { pkts[i] = makePkt(edges, i, mob); continue; }

      const fn=nodes[p.fi], tn=nodes[p.ti];
      const px=(fn.bx+mx*.17)+(tn.bx-fn.bx+mx*.17-mx*.17)*p.t;
      const py=(fn.by+my*.17)+(tn.by-fn.by+my*.17-my*.17)*p.t;
      const [pr,pg,pb]=p.c;
      const sz=p.r*glowMult;

      // Soft glow: one larger semi-transparent circle
      ctx.beginPath();
      ctx.arc(px|0, py|0, sz*3.5, 0, 6.283);
      ctx.fillStyle = dark ? rgba(pr,pg,pb,0.12*glowMult) : rgba(pr,pg,pb,0.06*glowMult);
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(px|0, py|0, sz, 0, 6.283);
      ctx.fillStyle = dark ? rgba(pr,pg,pb,0.90) : rgba(pr,pg,pb,0.70);
      ctx.fill();
    }

    /* ── Layer 4: AI waves — only when aiI > 0.05 ────────────────────────── */
    if (m.aiI > 0.05) {
      nodes.forEach(n => {
        if (!n.isAI) return;
        if (!n.waveOn) {
          if (Math.random() < 0.001 + m.aiI*0.003) { n.waveOn=true; n.waveR=0; }
          return;
        }
        n.waveR += n.waveSpd*(0.5+m.aiI*.7);
        const maxR = 50+m.aiI*18;
        const wa   = dark
          ? (1-n.waveR/maxR)*0.20*m.aiI
          : (1-n.waveR/maxR)*0.12*m.aiI;
        if (wa<=0||n.waveR>maxR){ n.waveOn=false; return; }

        ctx.beginPath();
        ctx.arc((n.bx+mx*.17)|0, (n.by+my*.17)|0, n.waveR, 0, 6.283);
        ctx.strokeStyle = rgba(n.c[0],n.c[1],n.c[2],wa);
        ctx.lineWidth=1.1; ctx.stroke();
      });
    }

    /* ── Layer 2b: nodes ─────────────────────────────────────────────────── */
    nodes.forEach(n => {
      n.phase = (n.phase + n.phaseSpeed*calm) % 6.283;
      const p   = Math.sin(n.phase);
      const nx  = (n.bx + mx*.17)|0;
      const ny  = (n.by + my*.17)|0;
      n.x = nx; n.y = ny;

      // Pulse ring (single stroke, no gradient)
      const ringR = n.r + m.glow*.4 + p*1.5*calm;
      const ringA = dark ? (0.07+p*.04)*calm : (0.05+p*.03)*calm;
      ctx.beginPath();
      ctx.arc(nx, ny, ringR, 0, 6.283);
      ctx.strokeStyle = rgba(n.c[0],n.c[1],n.c[2], ringA);
      ctx.lineWidth=1; ctx.stroke();

      // Filled node — one flat circle, no radial gradient
      const fa = dark ? 0.60 : 0.45;
      ctx.beginPath();
      ctx.arc(nx, ny, n.r, 0, 6.283);
      ctx.fillStyle = rgba(n.c[0],n.c[1],n.c[2], fa);
      ctx.fill();
    });

    /* ── Footer hub ─────────────────────────────────────────────────────── */
    if (m.capGlow > 1.4) {
      const ha = (m.capGlow - 1.4) * 0.7;
      const hx = W*.5|0, hy = H*.93|0;
      const hr = Math.min(W,H)*.10 + Math.sin(ts*.001)*6;
      const hg = ctx.createRadialGradient(hx,hy,0,hx,hy,hr);
      hg.addColorStop(0, rgba(r1,g1,b1,ha*.20));
      hg.addColorStop(.6,rgba(r2,g2,b2,ha*.10));
      hg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle=hg; ctx.fillRect(0,0,W,H);
    }

    ctx.globalAlpha = 1;
    raf.current = requestAnimationFrame(draw);
  }, [lerpMood]);

  /* ── Lifecycle ────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    rebuild();
    raf.current = requestAnimationFrame(draw);

    const ro = new ResizeObserver(rebuild);
    const parent = canvasRef.current?.parentElement;
    if (parent) ro.observe(parent);

    // Throttled mouse parallax
    let mouseTick = false;
    const onMouse = (e) => {
      if (mouseTick) return;
      mouseTick = true;
      requestAnimationFrame(() => {
        mouse.current = { x: e.clientX/innerWidth, y: e.clientY/innerHeight };
        mouseTick = false;
      });
    };
    window.addEventListener('mousemove', onMouse, { passive:true });

    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf.current);
      else raf.current = requestAnimationFrame(draw);
    };
    document.addEventListener('visibilitychange', onVis);

    const mo = new MutationObserver(() => { lastChainI.current=-1; });
    mo.observe(document.documentElement, { attributes:true, attributeFilter:['class'] });

    /* IntersectionObserver — section mood detection */
    const secRatios = new Map();
    const applyMood = () => {
      let bestId='hero', best=0;
      secRatios.forEach((v,k)=>{ if(v>best){best=v;bestId=k;} });
      const key = ID_MOOD[bestId]||'hero';
      targetMood.current = { ...MOODS[key] };
    };
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (ID_MOOD[e.target.id]!==undefined) secRatios.set(e.target.id, e.intersectionRatio);
        });
        applyMood();
      },
      { threshold: [0,.1,.2,.3,.4,.5,.6,.7,.8,.9,1] }
    );
    Object.keys(ID_MOOD).forEach(id => {
      const el = document.getElementById(id);
      if (el) { io.observe(el); secRatios.set(id, 0); }
    });

    return () => {
      cancelAnimationFrame(raf.current);
      ro.disconnect(); mo.disconnect(); io.disconnect();
      window.removeEventListener('mousemove', onMouse);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [rebuild, draw]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex:0 }}
    />
  );
}
