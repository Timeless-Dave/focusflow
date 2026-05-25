import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMemo, useRef } from 'react';

import './SplitText.css';

/**
 * Fallback split animation (free GSAP; no SplitText Club plugin required).
 */
export default function SplitText({
  text,
  className = '',
  splitBy = 'word',
  as: Tag = 'span',
  stagger = 0.05,
  y = 12,
  duration = 0.55,
  once = true,
  role,
  id,
  'aria-label': ariaLabel
}) {
  const rootRef = useRef(null);

  const segments = useMemo(() => splitString(text ?? '', splitBy), [text, splitBy]);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      if (!rootRef.current) return;
      const parts = [...rootRef.current.querySelectorAll('[data-split-part]')];
      if (!parts.length) return;

      gsap.fromTo(
        parts,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration,
          stagger,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top 92%',
            once
          }
        }
      );
    },
    { scope: rootRef, dependencies: [stagger, y, duration, once, segments] }
  );

  return (
    <Tag
      ref={rootRef}
      className={`split-text ${className}`.trim()}
      role={role}
      id={id}
      aria-label={ariaLabel ?? (typeof text === 'string' ? text : undefined)}
    >
      {segments.map(({ key, gap, chars }) =>
        gap ? (
          chars
        ) : (
          <span key={key} data-split-part className="split-text__part">
            {chars}
          </span>
        )
      )}
    </Tag>
  );
}

function splitString(str, splitBy) {
  const out = [];
  if (!str) return out;

  if (splitBy === 'char') {
    [...str].forEach((c, i) => {
      out.push({
        key: `c-${i}`,
        gap: c === ' ',
        chars: c
      });
    });
    return out;
  }

  const raw = str.split(/(\s+)/);
  raw.forEach((chunk, i) => {
    if (!chunk) return;
    const gap = /\s+/.test(chunk);
    out.push({ key: `w-${i}`, gap, chars: gap ? chunk : chunk });
  });
  return out;
}
