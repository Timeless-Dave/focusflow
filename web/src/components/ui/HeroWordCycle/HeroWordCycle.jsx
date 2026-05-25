'use client';

import { motion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './HeroWordCycle.css';

const SWIPE_EASE = [0.22, 1, 0.36, 1];

/**
 * Cycles hero pillar words — alternates typing and swipe based on each entry's effect.
 * Pill width follows the active word via a hidden measure span.
 */
export default function HeroWordCycle({
  words,
  typeSpeedMs = 58,
  deleteSpeedMs = 36,
  typePauseMs = 1400,
  swipeHoldMs = 1800,
  swipeDurationMs = 360,
  className = ''
}) {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [swipeOut, setSwipeOut] = useState(false);
  const measureRef = useRef(null);
  const [slotWidth, setSlotWidth] = useState(undefined);

  const current = words[index] ?? words[0];
  const isTyping = current?.effect === 'type';
  const displayForMeasure = isTyping ? (typed || '\u00a0') : current?.text ?? '';

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    setSlotWidth(el.offsetWidth);
  }, [displayForMeasure, index, isTyping, typed, swipeOut]);

  const advance = () => setIndex((i) => (i + 1) % words.length);

  useEffect(() => {
    if (!isTyping) {
      setTyped('');
      setDeleting(false);
      return;
    }

    const target = current.text;
    let delay = deleting ? deleteSpeedMs : typeSpeedMs;
    if (!deleting && typed === target) delay = typePauseMs;

    const id = window.setTimeout(() => {
      if (!deleting) {
        if (typed.length < target.length) {
          setTyped(target.slice(0, typed.length + 1));
        } else {
          setDeleting(true);
        }
      } else if (typed.length > 0) {
        setTyped(typed.slice(0, -1));
      } else {
        setDeleting(false);
        advance();
      }
    }, delay);

    return () => window.clearTimeout(id);
  }, [isTyping, typed, deleting, current.text, typeSpeedMs, deleteSpeedMs, typePauseMs]);

  useEffect(() => {
    if (isTyping) return undefined;
    setSwipeOut(false);
    const hold = window.setTimeout(() => setSwipeOut(true), swipeHoldMs);
    return () => window.clearTimeout(hold);
  }, [index, isTyping, swipeHoldMs]);

  const handleSwipeComplete = () => {
    if (!swipeOut) return;
    advance();
  };

  return (
    <span
      className={`hero-word-cycle ${className}`.trim()}
      style={slotWidth != null ? { width: slotWidth } : undefined}
      aria-live="polite"
    >
      <span ref={measureRef} className="hero-word-cycle__measure" aria-hidden="true">
        {displayForMeasure}
      </span>

      <span className="hero-word-cycle__display">
        {isTyping ? (
          <>
            <span className="hero-word-cycle__typed">{typed}</span>
            <span className="hero-word-cycle__cursor" aria-hidden="true" />
          </>
        ) : (
          <motion.span
            key={`swipe-${index}-${current.text}`}
            className="hero-word-cycle__swipe"
            initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
            animate={
              swipeOut
                ? { opacity: 0, y: -12, filter: 'blur(6px)' }
                : { opacity: 1, y: 0, filter: 'blur(0px)' }
            }
            transition={{ duration: swipeDurationMs / 1000, ease: SWIPE_EASE }}
            onAnimationComplete={handleSwipeComplete}
          >
            {current.text}
          </motion.span>
        )}
      </span>
    </span>
  );
}
