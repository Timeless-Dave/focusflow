'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { brandPaths } from '@/config';
import './AssistantFab.css';

const PROMPTS = [
  'How does Live Mode help when attention drops?',
  'What makes lessons ADHD-tailored?',
  'Can parents get actionable next steps?',
  'Is there homeschool support?'
];

export default function AssistantFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        className="assistant-fab"
        aria-label="FocusFlow assistant"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        animate={{ y: [0, -4, 0] }}
        transition={{ y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <span className="assistant-fab__ring" aria-hidden />
        <img src={brandPaths.logoMark} alt="" className="assistant-fab__logo" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              className="assistant-fab__backdrop"
              aria-label="Close assistant"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="assistant-fab__panel"
              role="dialog"
              aria-label="FocusFlow assistant"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="assistant-fab__head">
                <img src={brandPaths.logoMark} alt="" />
                <div>
                  <strong>FocusFlow Guide</strong>
                  <p>Ask about ADHD classroom support</p>
                </div>
              </div>
              <ul className="assistant-fab__prompts">
                {PROMPTS.map(q => (
                  <li key={q}>
                    <button type="button" onClick={() => setOpen(false)}>
                      {q}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="assistant-fab__note">Full AI chat coming soon — early access onboarding is live.</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
