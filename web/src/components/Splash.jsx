'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { brandPaths } from '@/config';
import './Splash.css';

const MC_EASE = [0.22, 1, 0.36, 1];
const MIN_VISIBLE_MS = 280;
const EXIT_MS = 220;

export function useSplash() {
  const [phase, setPhase] = useState('show'); // show | exit | done

  useEffect(() => {
    let cancelled = false;
    let exitTimer;
    let doneTimer;
    const mountAt = performance.now();

    const beginExit = () => {
      const elapsed = performance.now() - mountAt;
      const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);

      exitTimer = window.setTimeout(() => {
        if (cancelled) return;
        setPhase('exit');
        doneTimer = window.setTimeout(() => {
          if (!cancelled) setPhase('done');
        }, EXIT_MS);
      }, wait);
    };

    // Dismiss on DOM ready — do not wait for every image/asset (window "load").
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', beginExit, { once: true });
    } else {
      beginExit();
    }

    return () => {
      cancelled = true;
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
      document.removeEventListener('DOMContentLoaded', beginExit);
    };
  }, []);

  useEffect(() => {
    const visible = phase !== 'done';
    document.body.style.overflow = visible ? 'hidden' : '';
    document.body.classList.toggle('splash-active', visible);
    if (phase === 'done') {
      document.body.classList.add('page-ready');
      document.querySelector('.hero')?.classList.add('visible');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('splash-active');
    };
  }, [phase]);

  const onEnterComplete = useCallback(() => {}, []);

  return { visible: phase !== 'done', phase, onEnterComplete };
}

export default function Splash({ visible, phase }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="splash"
          className="splash-screen splash-minimal"
          aria-hidden="true"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: MC_EASE }}
        >
          <motion.img
            src={brandPaths.logoMark}
            alt=""
            className="splash-minimal__logo"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{
              opacity: phase === 'exit' ? 0 : 1,
              scale: phase === 'exit' ? 1.04 : 1
            }}
            transition={{ duration: 0.28, ease: MC_EASE }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
