import { useEffect, useState } from 'react';
import './TypingRotatingText.css';

/**
 * Cycles through words with typewriter delete + type (hero pillar words).
 */
export default function TypingRotatingText({
  words,
  typeSpeedMs = 58,
  deleteSpeedMs = 36,
  pauseMs = 1500,
  className = ''
}) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const current = words[wordIndex] ?? '';

  useEffect(() => {
    setText('');
    setDeleting(false);
  }, [wordIndex]);

  useEffect(() => {
    let delay = deleting ? deleteSpeedMs : typeSpeedMs;

    if (!deleting && text === current) {
      delay = pauseMs;
    }

    const id = window.setTimeout(() => {
      if (!deleting) {
        if (text.length < current.length) {
          setText(current.slice(0, text.length + 1));
        } else {
          setDeleting(true);
        }
      } else if (text.length > 0) {
        setText(text.slice(0, -1));
      } else {
        setDeleting(false);
        setWordIndex(i => (i + 1) % words.length);
      }
    }, delay);

    return () => window.clearTimeout(id);
  }, [text, deleting, current, words.length, typeSpeedMs, deleteSpeedMs, pauseMs]);

  const maxLen = Math.max(...words.map(w => w.length), 4);

  return (
    <span
      className={`typing-rotating ${className}`.trim()}
      style={{ minWidth: `${maxLen * 0.58}em` }}
      aria-live="polite"
    >
      <span className="typing-rotating__word">{text}</span>
      <span className="typing-rotating__cursor" aria-hidden />
    </span>
  );
}
