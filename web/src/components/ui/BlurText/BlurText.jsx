import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMemo, useRef } from 'react';

import './BlurText.css';

export default function BlurText({
  text,
  className = '',
  as: Tag = 'span',
  initialBlurPx = 14,
  duration = 1.05,
  splitBy = 'char',
  once = true
}) {
  const rootRef = useRef(null);

  const segments = useMemo(() => splitString(text ?? '', splitBy), [text, splitBy]);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      if (!rootRef.current) return;
      const parts = [...rootRef.current.querySelectorAll('[data-blur-char]')];
      if (!parts.length) return;

      gsap.fromTo(
        parts,
        {
          opacity: 0,
          filter: `blur(${initialBlurPx}px)`,
          y: 14
        },
        {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          duration,
          ease: 'power2.out',
          stagger: splitBy === 'char' ? 0.035 : 0.08,
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top 88%',
            once
          }
        }
      );
    },
    { scope: rootRef, dependencies: [initialBlurPx, duration, splitBy, once, segments] }
  );

  return (
    <Tag ref={rootRef} className={`blur-text ${className}`.trim()}>
      {segments.map(({ key, gap, chars }) =>
        gap ? (
          chars
        ) : (
          <span key={key} data-blur-char className="blur-text__part">
            {chars}
          </span>
        )
      )}
    </Tag>
  );
}

function splitString(str, splitBy) {
  const out = [];

  if (splitBy === 'char') {
    [...str].forEach((c, i) =>
      out.push({
        key: `c-${i}`,
        gap: c === ' ',
        chars: c
      })
    );
    return out;
  }

  str.split(/(\s+)/).forEach((chunk, i) => {
    if (!chunk) return;
    const gap = /\s+/.test(chunk);
    out.push({ key: `w-${i}`, gap, chars: gap ? chunk : chunk });
  });
  return out;
}
