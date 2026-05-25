import { useCallback, useRef } from 'react';

import './ClickSpark.css';

export default function ClickSpark({
  children,
  className = '',
  colors = ['#c4b5fd', '#a78bfa', '#e9d5ff'],
  particleCount = 9,
  sizeRatio = 0.035,
  spread = 60,
  throttleMs = 90
}) {
  const wrapRef = useRef(null);
  const lastBurst = useRef(0);

  const splash = useCallback(
    (clientX, clientY) => {
      const shell = wrapRef.current;
      if (!shell || !particleCount || !colors.length) return;

      const r = shell.getBoundingClientRect();
      const fx = Math.min(Math.max(clientX - r.left, -12), r.width + 12);
      const fy = Math.min(Math.max(clientY - r.top, -12), r.height + 12);

      for (let i = 0; i < particleCount; i += 1) {
        const p = document.createElement('span');
        p.className = 'click-spark__particle';
        p.style.background = colors[i % colors.length];
        const size = Math.max(4, shell.clientWidth * sizeRatio + Math.random() * 4);

        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.4;
        const dist = spread * (0.45 + Math.random());
        const tx = fx + Math.cos(angle) * dist;
        const ty = fy + Math.sin(angle) * dist * -1;
        const scale = 0.7 + Math.random();

        Object.assign(p.style, {
          left: `${fx}px`,
          top: `${fy}px`,
          width: `${size}px`,
          height: `${size}px`,
          boxShadow: `0 0 ${size * 1.25}px rgba(167,139,250,0.55)`
        });

        shell.appendChild(p);
        requestAnimationFrame(() => {
          p.animate(
            [
              { transform: 'translate(-50%,-50%) scale(0.65)', opacity: 0.95 },
              { transform: `translate(calc(${tx}px - 50%), calc(${ty}px - 50%)) scale(${scale})`, opacity: 0 }
            ],
            { duration: 520 + Math.random() * 220, easing: 'cubic-bezier(0.34, 1.56, 0.38, 0.93)' }
          ).onfinish = () => p.remove();
        });
      }
    },
    [colors, particleCount, sizeRatio, spread]
  );

  const onPointerDown = useCallback(
    e => {
      if (typeof performance !== 'undefined') {
        if (performance.now() - lastBurst.current < throttleMs) return;
        lastBurst.current = performance.now();
      }
      splash(
        e.clientX ?? (e.changedTouches?.[0]?.clientX ?? 0),
        e.clientY ?? (e.changedTouches?.[0]?.clientY ?? 0)
      );
      if ('vibrate' in navigator) navigator.vibrate(12);
    },
    [splash, throttleMs]
  );

  return (
    <div ref={wrapRef} className={`click-spark ${className}`.trim()} onPointerDown={onPointerDown}>
      {children}
    </div>
  );
}
