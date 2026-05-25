import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import './RotatingText.css';

const SWIPE_EASE = [0.22, 1, 0.36, 1];

export default function RotatingText({ words, intervalMs = 2200, className = '' }) {
  const [index, setIndex] = useState(0);
  const measureRef = useRef(null);
  const [slotWidth, setSlotWidth] = useState(undefined);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, words.length]);

  const current = words[index] ?? '';

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    setSlotWidth(el.offsetWidth);
  }, [current, index]);

  return (
    <span
      className={`rotating-text ${className}`.trim()}
      style={slotWidth != null ? { width: slotWidth } : undefined}
      aria-live="polite"
    >
      <span ref={measureRef} className="rotating-text__measure" aria-hidden="true">
        {current}
      </span>
      <span className="rotating-text__slot">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={current}
            className="rotating-text__word"
            initial={{ opacity: 0, y: 12, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
            transition={{ duration: 0.34, ease: SWIPE_EASE }}
          >
            {current}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
