import { useCallback, useRef } from 'react';

import './VariableProximity.css';

function splitPreserve(text) {
  return text.split(/(\s+)/).filter(Boolean);
}

/**
 * Proximity-sensitive letter/word emphasis (mouse-distance falloff).
 */
export default function VariableProximity({
  text,
  className = '',
  radius = 120,
  maxLift = 0.06,
  minLift = -0.02,
  as: Tag = 'span',
  ariaHidden
}) {
  const rootRef = useRef(null);

  const onMove = useCallback(
    e => {
      const el = rootRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      const spans = el.querySelectorAll('[data-prox-letter]');

      spans.forEach(node => {
        const b = node.getBoundingClientRect();
        const cx = b.left + b.width / 2 - r.left;
        const cy = b.top + b.height / 2 - r.top;
        const d = Math.hypot(mx - cx, my - cy);
        const n = Math.max(0, 1 - d / radius);
        const lift = minLift + (maxLift - minLift) * n;
        node.style.setProperty('--vp-lift', `${lift}`);
        node.style.setProperty('--vp-strong', `${0.65 + n * 0.35}`);
      });
    },
    [radius, maxLift, minLift]
  );

  const onLeave = useCallback(() => {
    rootRef.current?.querySelectorAll('[data-prox-letter]').forEach(node => {
      node.style.setProperty('--vp-lift', `${minLift}`);
      node.style.setProperty('--vp-strong', '1');
    });
  }, [minLift]);

  const chunks = typeof text === 'string' ? splitPreserve(text) : [];

  return (
    <Tag
      ref={rootRef}
      className={`variable-proximity ${className}`.trim()}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-hidden={ariaHidden}
    >
      {chunks.map((chunk, wi) =>
        /\s+/.test(chunk) ? (
          <span key={wi} className="variable-proximity__space">
            {chunk}
          </span>
        ) : (
          <span key={wi} className="variable-proximity__word" aria-hidden>
            {[...chunk].map((ch, ci) =>
              ch ? (
                <span key={ci} data-prox-letter className="variable-proximity__letter">
                  {ch}
                </span>
              ) : null
            )}
          </span>
        )
      )}
    </Tag>
  );
}
