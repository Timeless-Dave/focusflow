import { useEffect, useMemo, useState } from 'react';

import './TextType.css';

export default function TextType({
  text,
  charDelayMs = 18,
  className = '',
  showCursor = true,
  cursorBlinkMs = 520,
  ariaLabel
}) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setShown(0);
  }, [text]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setShown(s => Math.min(text.length, s + 1));
    }, charDelayMs);
    return () => window.clearInterval(id);
  }, [charDelayMs, text]);

  const visible = text.slice(0, shown);

  const blinkStyle = useMemo(
    () => ({
      animationDuration: `${cursorBlinkMs}ms`
    }),
    [cursorBlinkMs]
  );

  return (
    <span className={`text-type ${className}`.trim()} aria-label={ariaLabel ?? text}>
      <span className="text-type__body">{visible}</span>
      {showCursor ? <span className="text-type__cursor" style={blinkStyle} aria-hidden /> : null}
    </span>
  );
}
