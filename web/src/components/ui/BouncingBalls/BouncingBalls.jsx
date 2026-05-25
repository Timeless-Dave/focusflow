'use client';

import { useEffect, useRef } from 'react';
import './BouncingBalls.css';

const BALL_COLORS = ['#FFD66B', '#C7C1FF', '#FFB4C4', '#B8F5D4', '#FFD6A5', '#A99BFF', '#F97316', '#7C3AED'];

function createBall(width, height, radius) {
  const r = radius ?? 10 + Math.random() * 14;
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.6 + Math.random() * 1.1;
  return {
    x: r + Math.random() * (width - r * 2),
    y: r + Math.random() * (height - r * 2),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    r,
    color: BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)]
  };
}

export default function BouncingBalls({ count = 10, className = '' }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const stateRef = useRef({ balls: [], width: 0, height: 0, pointer: null });
  const rafRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      stateRef.current.width = rect.width;
      stateRef.current.height = rect.height;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (stateRef.current.balls.length === 0) {
        stateRef.current.balls = Array.from({ length: count }, () =>
          createBall(rect.width, rect.height)
        );
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const onPointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      stateRef.current.pointer = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: e.buttons > 0 || e.type === 'pointerdown'
      };
    };

    const onPointerUp = () => {
      if (stateRef.current.pointer) stateRef.current.pointer.active = false;
    };

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerUp);

    const MAX_SPEED = 2.8;
    const MIN_SPEED = 0.85;
    const WALL_BOUNCE = 0.82;
    const BALL_BOUNCE = 0.88;
    const INSET = 14;

    const tick = () => {
      const { balls, width, height, pointer } = stateRef.current;
      if (width < 1 || height < 1) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const left = INSET;
      const top = INSET;
      const right = width - INSET;
      const bottom = height - INSET;

      for (let i = 0; i < balls.length; i += 1) {
        const b = balls[i];

        if (pointer?.active) {
          const dx = b.x - pointer.x;
          const dy = b.y - pointer.y;
          const dist = Math.hypot(dx, dy) || 1;
          const reach = b.r + 28;
          if (dist < reach) {
            const force = ((reach - dist) / reach) * 0.35;
            b.vx += (dx / dist) * force;
            b.vy += (dy / dist) * force;
          }
        }

        b.x += b.vx;
        b.y += b.vy;

        if (b.x - b.r < left) {
          b.x = left + b.r;
          b.vx = Math.abs(b.vx) * WALL_BOUNCE;
        }
        if (b.x + b.r > right) {
          b.x = right - b.r;
          b.vx = -Math.abs(b.vx) * WALL_BOUNCE;
        }
        if (b.y - b.r < top) {
          b.y = top + b.r;
          b.vy = Math.abs(b.vy) * WALL_BOUNCE;
        }
        if (b.y + b.r > bottom) {
          b.y = bottom - b.r;
          b.vy = -Math.abs(b.vy) * WALL_BOUNCE;
        }

        let speed = Math.hypot(b.vx, b.vy);
        if (speed < MIN_SPEED) {
          const angle = speed > 0.01 ? Math.atan2(b.vy, b.vx) : Math.random() * Math.PI * 2;
          b.vx = Math.cos(angle) * MIN_SPEED;
          b.vy = Math.sin(angle) * MIN_SPEED;
          speed = MIN_SPEED;
        }
        if (speed > MAX_SPEED) {
          b.vx = (b.vx / speed) * MAX_SPEED;
          b.vy = (b.vy / speed) * MAX_SPEED;
        }

        for (let j = i + 1; j < balls.length; j += 1) {
          const o = balls[j];
          const dx = o.x - b.x;
          const dy = o.y - b.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          const minDist = b.r + o.r;

          if (dist < minDist) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = minDist - dist;
            b.x -= (nx * overlap) / 2;
            b.y -= (ny * overlap) / 2;
            o.x += (nx * overlap) / 2;
            o.y += (ny * overlap) / 2;

            const dvx = b.vx - o.vx;
            const dvy = b.vy - o.vy;
            const impact = dvx * nx + dvy * ny;
            if (impact > 0) {
              const impulse = impact * BALL_BOUNCE;
              b.vx -= impulse * nx;
              b.vy -= impulse * ny;
              o.vx += impulse * nx;
              o.vy += impulse * ny;
            }
          }
        }
      }

      ctx.clearRect(0, 0, width, height);

      for (const b of balls) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#0b1220';
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [count]);

  return (
    <div ref={wrapRef} className={`bouncing-balls ${className}`.trim()}>
      <div className="bouncing-balls__bg media-bg lavender" aria-hidden="true" />
      <canvas ref={canvasRef} className="bouncing-balls__canvas" aria-hidden="true" />
    </div>
  );
}
