import React, { useRef, useEffect, useCallback } from 'react';

/* ─── Node Definitions ─────────────────────────────────────────────────────
   Each node represents a participant in the Invoice2Credit ecosystem.
   Positions are expressed as fractions [0–1] of canvas width/height.
   ────────────────────────────────────────────────────────────────────────── */
const NODE_DEFS = [
  { id: 'msme',      label: 'MSME',       fx: 0.18, fy: 0.30 },
  { id: 'ai',        label: 'AI',         fx: 0.50, fy: 0.22 },
  { id: 'gst',       label: 'GST',        fx: 0.80, fy: 0.32 },
  { id: 'blockchain',label: 'Chain',      fx: 0.82, fy: 0.65 },
  { id: 'escrow',    label: 'Escrow',     fx: 0.50, fy: 0.75 },
  { id: 'investor',  label: 'Investor',   fx: 0.18, fy: 0.68 },
  { id: 'buyer',     label: 'Buyer',      fx: 0.64, fy: 0.48 },
  { id: 'wallet',    label: 'Wallet',     fx: 0.34, fy: 0.50 },
];

/* Connections: [fromId, toId] */
const CONNECTIONS = [
  ['msme',       'ai'],
  ['msme',       'wallet'],
  ['ai',         'gst'],
  ['ai',         'buyer'],
  ['gst',        'blockchain'],
  ['wallet',     'escrow'],
  ['buyer',      'blockchain'],
  ['blockchain', 'escrow'],
  ['escrow',     'investor'],
  ['investor',   'wallet'],
  ['buyer',      'escrow'],
  ['msme',       'buyer'],
];

/* Packets travel along connections carrying different "meanings" */
const PACKET_COLORS_DARK  = ['#60a5fa','#a78bfa','#34d399','#f59e0b','#22d3ee'];
const PACKET_COLORS_LIGHT = ['#2563eb','#7c3aed','#059669','#d97706','#0891b2'];

function isDarkMode() {
  return document.documentElement.classList.contains('dark');
}

export default function FinancialNetworkBackground() {
  const canvasRef = useRef(null);
  const stateRef  = useRef({});
  const rafRef    = useRef(null);
  const mouseRef  = useRef({ x: 0.5, y: 0.5 });

  /* ── Resize handler ───────────────────────────────────────────────────── */
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = canvas.offsetWidth  * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    /* Rebuild node positions */
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    const isMobile = W < 640;

    const nodes = NODE_DEFS
      .filter((_, i) => !isMobile || i < 6)          // fewer nodes on mobile
      .map(def => ({
        ...def,
        x:    def.fx * W,
        y:    def.fy * H,
        baseX: def.fx * W,
        baseY: def.fy * H,
        r:    isMobile ? 5 : 6,
        pulse: 0,
        pulseSpeed: 0.012 + Math.random() * 0.008,
      }));

    /* Build connection index */
    const nodeMap = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });

    const edges = CONNECTIONS
      .filter(([a, b]) => nodeMap[a] && nodeMap[b])
      .map(([a, b]) => ({ from: nodeMap[a], to: nodeMap[b] }));

    /* Spawn initial packets */
    const packets = edges.map(edge => createPacket(edge, isMobile));

    stateRef.current = { nodes, edges, packets, W, H, isMobile, nodeMap };
  }, []);

  /* ── Packet factory ───────────────────────────────────────────────────── */
  function createPacket(edge, isMobile) {
    return {
      edge,
      t:     Math.random(),               // position along edge [0,1]
      speed: 0.0012 + Math.random() * 0.0018,
      size:  isMobile ? 2 : 3,
      colorIdx: Math.floor(Math.random() * PACKET_COLORS_DARK.length),
    };
  }

  /* ── Main draw loop ───────────────────────────────────────────────────── */
  const draw = useCallback((ts) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx  = canvas.getContext('2d');
    const s    = stateRef.current;
    if (!s.nodes) return;

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    const dark = isDarkMode();

    /* Background */
    ctx.clearRect(0, 0, W, H);
    if (dark) {
      ctx.fillStyle = 'rgba(5,10,26,0)';   // transparent – CSS handles bg
    }

    /* Mouse parallax offsets (max ±12px) */
    const mx = (mouseRef.current.x - 0.5) * 24;
    const my = (mouseRef.current.y - 0.5) * 24;

    /* Update node positions with gentle parallax */
    s.nodes.forEach(n => {
      n.x = n.baseX + mx * 0.25;
      n.y = n.baseY + my * 0.25;
      n.pulse = (n.pulse + n.pulseSpeed) % (Math.PI * 2);
    });

    /* ── Draw edges ──────────────────────────────────────────────────────── */
    s.edges.forEach(edge => {
      const { from, to } = edge;
      const grad = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
      if (dark) {
        grad.addColorStop(0,   'rgba(99,102,241,0.18)');
        grad.addColorStop(0.5, 'rgba(139,92,246,0.22)');
        grad.addColorStop(1,   'rgba(34,211,238,0.18)');
      } else {
        grad.addColorStop(0,   'rgba(37,99,235,0.10)');
        grad.addColorStop(0.5, 'rgba(124,58,237,0.12)');
        grad.addColorStop(1,   'rgba(8,145,178,0.10)');
      }
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    /* ── Move & draw packets ─────────────────────────────────────────────── */
    s.packets.forEach(pkt => {
      pkt.t += pkt.speed;
      if (pkt.t > 1) {
        pkt.t = 0;
        pkt.speed = 0.0012 + Math.random() * 0.0018;
      }
      const { from, to } = pkt.edge;
      const px = from.x + (to.x - from.x) * pkt.t;
      const py = from.y + (to.y - from.y) * pkt.t;

      const colors = dark ? PACKET_COLORS_DARK : PACKET_COLORS_LIGHT;
      const col    = colors[pkt.colorIdx];

      /* Glow */
      const grd = ctx.createRadialGradient(px, py, 0, px, py, pkt.size * 4);
      grd.addColorStop(0,   col + (dark ? '88' : '44'));
      grd.addColorStop(1,   col + '00');
      ctx.beginPath();
      ctx.arc(px, py, pkt.size * 4, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      /* Core dot */
      ctx.beginPath();
      ctx.arc(px, py, pkt.size, 0, Math.PI * 2);
      ctx.fillStyle = col + (dark ? 'cc' : '99');
      ctx.fill();
    });

    /* ── Draw nodes ──────────────────────────────────────────────────────── */
    s.nodes.forEach(n => {
      const pulse   = Math.sin(n.pulse);
      const glowR   = n.r + 6 + pulse * 3;

      /* Outer pulse ring */
      const ringOpacity = dark
        ? (0.08 + pulse * 0.06)
        : (0.06 + pulse * 0.04);
      ctx.beginPath();
      ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
      ctx.strokeStyle = dark
        ? `rgba(139,92,246,${ringOpacity})`
        : `rgba(37,99,235,${ringOpacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      /* Inner node circle */
      const nodeGrd = ctx.createRadialGradient(n.x - 1, n.y - 1, 0, n.x, n.y, n.r);
      if (dark) {
        nodeGrd.addColorStop(0, 'rgba(165,180,252,0.55)');
        nodeGrd.addColorStop(1, 'rgba(99,102,241,0.35)');
      } else {
        nodeGrd.addColorStop(0, 'rgba(99,102,241,0.40)');
        nodeGrd.addColorStop(1, 'rgba(37,99,235,0.25)');
      }
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = nodeGrd;
      ctx.fill();

      /* Node label */
      ctx.font = `bold ${s.isMobile ? 8 : 9}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = dark
        ? 'rgba(199,210,254,0.55)'
        : 'rgba(55,65,81,0.55)';
      ctx.fillText(n.label, n.x, n.y + n.r + 4);
    });

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  /* ── Lifecycle ────────────────────────────────────────────────────────── */
  useEffect(() => {
    /* Respect reduced-motion */
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    resize();
    rafRef.current = requestAnimationFrame(draw);

    const ro = new ResizeObserver(resize);
    ro.observe(canvasRef.current?.parentElement || document.body);

    /* Mouse parallax */
    const onMove = (e) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    /* Pause when tab hidden */
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        rafRef.current = requestAnimationFrame(draw);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    /* Dark mode observer */
    const mo = new MutationObserver(resize);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [resize, draw]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0, display: 'block' }}
    />
  );
}
