'use client';

import { useEffect, useRef } from 'react';

const COLORS = ['#ffaf01', '#ff8204', '#fa500f', '#e51300', '#c4001d'];

// Deterministic hash so the mosaic has the same silhouette on every render and
// between server/client. No Math.random at paint time.
function hash(x, y, seed = 0) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * An animated pixel field. Cells snap into a mosaic on mount, breathe while
 * idle, and scatter away from the pointer. The silhouette is a pixelated
 * explosion: dense warm core, sparks along the diagonals.
 */
export default function PixelCanvas({ className = '', variant = 'burst', cell = 13 }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let unit = cell;
    let cells = [];
    let raf = 0;
    let running = true;
    let start = performance.now();
    const pointer = { x: -999, y: -999, active: false };
    let burst = { x: -999, y: -999, t: -99 };

    const paletteAt = (radius) => {
      if (radius < 0.14) return COLORS[0];
      if (radius < 0.3) return COLORS[1];
      if (radius < 0.48) return COLORS[2];
      if (radius < 0.68) return COLORS[3];
      return COLORS[4];
    };

    const build = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      unit = width < 640 ? Math.max(8, cell * 0.72) : cell;
      cols = Math.max(8, Math.floor(width / unit));
      rows = Math.max(6, Math.floor(height / unit));
      const cellW = width / cols;
      const cellH = height / rows;
      const cx = (cols - 1) / 2;
      const cy = (rows - 1) / 2;
      const maxR = Math.sqrt(cx * cx + cy * cy) || 1;

      cells = [];
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const nx = (x - cx) / maxR;
          const ny = (y - cy) / maxR;
          const radius = Math.sqrt(nx * nx + ny * ny);
          const angle = Math.atan2(ny, nx);
          const spark =
            Math.abs(Math.sin(angle * 4)) > 0.94 && radius < 0.94 ? hash(x, y, 3) > 0.18 : false;
          const speck = hash(x, y, 11);
          let active = false;

          if (variant === 'field') {
            active = speck > 0.62 || radius < 0.16;
          } else {
            const threshold = 0.24 + radius * 0.95;
            active = (radius < 0.86 && speck > threshold) || spark || radius < 0.1;
            // Silence the very outer ring so the mosaic dissolves into the page.
            if (radius > 0.9 && speck < 0.55) active = false;
          }

          if (!active) continue;

          cells.push({
            x,
            y,
            px: x * cellW,
            py: y * cellH,
            w: cellW,
            h: cellH,
            color: paletteAt(radius * (0.82 + hash(x, y, 5) * 0.36)),
            phase: hash(x, y, 7) * Math.PI * 2,
            amp: 0.8 + hash(x, y, 13) * 1.9,
            delay: radius * 420 + hash(x, y, 17) * 260,
            fromX: (hash(x, y, 19) - 0.5) * width * 0.5,
            fromY: (hash(x, y, 23) - 0.5) * height * 0.85,
            scale: 0.82 + hash(x, y, 29) * 0.36,
          });
        }
      }
    };

    const easeOut = (t) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

    const draw = (now) => {
      const elapsed = now - start;
      const t = elapsed / 1000;
      ctx.clearRect(0, 0, width, height);

      for (const c of cells) {
        const intro = reduce ? 1 : easeOut((elapsed - c.delay) / 620);
        if (intro <= 0) continue;

        let x = c.px + (1 - intro) * c.fromX;
        let y = c.py + (1 - intro) * c.fromY;
        let scale = (0.4 + 0.6 * intro) * c.scale;

        if (!reduce && intro >= 1) {
          y += Math.sin(t * 0.9 + c.phase) * c.amp;
          x += Math.cos(t * 0.6 + c.phase) * c.amp * 0.35;
          scale *= 1 + Math.sin(t * 1.35 + c.phase) * 0.05;

          if (pointer.active) {
            const dx = c.px + c.w / 2 - pointer.x;
            const dy = c.py + c.h / 2 - pointer.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const reach = 150;
            if (dist < reach) {
              const force = (1 - dist / reach) * 20;
              x += (dx / (dist || 1)) * force;
              y += (dy / (dist || 1)) * force;
              scale *= 1 + (1 - dist / reach) * 0.35;
            }
          }

          const age = t - burst.t;
          if (age >= 0 && age < 1.4) {
            const dx = c.px - burst.x;
            const dy = c.py - burst.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const wave = Math.max(0, 1 - Math.abs(dist - age * 380) / 120);
            x += (dx / dist) * wave * 16;
            y += (dy / dist) * wave * 16;
            scale *= 1 + wave * 0.7;
          }
        }

        const w = Math.max(1.5, c.w * scale - 1.6);
        const h = Math.max(1.5, c.h * scale - 1.6);
        const inset = (c.w - w) / 2;
        const insetY = (c.h - h) / 2;
        ctx.globalAlpha = 0.5 + intro * 0.5;
        ctx.fillStyle = c.color;
        ctx.fillRect(x + inset, y + insetY, w, h);
      }

      ctx.globalAlpha = 1;

      if (running && !reduce) raf = requestAnimationFrame(draw);
    };

    const onPointer = (event) => {
      const rect = wrap.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onClick = (event) => {
      const rect = wrap.getBoundingClientRect();
      burst = { x: event.clientX - rect.left, y: event.clientY - rect.top, t: (performance.now() - start) / 1000 };
    };
    const onVisibility = () => {
      running = !document.hidden;
      if (running && !reduce) {
        start = performance.now() - 4000;
        raf = requestAnimationFrame(draw);
      }
    };

    build();
    start = performance.now();
    raf = requestAnimationFrame(draw);

    const resizeObserver = new ResizeObserver(() => {
      build();
      if (reduce) draw(performance.now());
    });
    resizeObserver.observe(wrap);

    wrap.addEventListener('pointermove', onPointer);
    wrap.addEventListener('pointerleave', onLeave);
    wrap.addEventListener('pointerdown', onClick);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      running = false;
      resizeObserver.disconnect();
      wrap.removeEventListener('pointermove', onPointer);
      wrap.removeEventListener('pointerleave', onLeave);
      wrap.removeEventListener('pointerdown', onClick);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [cell, variant]);

  return (
    <div ref={wrapRef} className={`ef-pixelcanvas ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
