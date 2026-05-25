import { useCallback, useMemo, useRef } from 'react';

import './TextPressure.css';

/**
 * Heading weight subtly follows pointer pressure via variable font axes (falls back gracefully).
 */
export default function TextPressure({
  children,
  className = '',
  intensity = 0.52,
  as: Tag = 'span'
}) {
  const ref = useRef(null);

  const onMove = useCallback(
    e => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      const nx = (px / r.width - 0.5) * 2;
      const ny = (py / r.height - 0.5) * 2;
      const strain = Math.min(1, Math.hypot(nx, ny));
      el.style.setProperty('--tp-strain', String(strain * intensity));
      el.style.setProperty('--tp-tilt', `${nx * intensity * 1.25}deg`);
    },
    [intensity]
  );

  const onLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.setProperty('--tp-strain', '0');
    ref.current.style.setProperty('--tp-tilt', '0deg');
  }, []);

  const style = useMemo(
    () => ({
      '--tp-strain': 0,
      '--tp-tilt': '0deg'
    }),
    []
  );

  return (
    <Tag ref={ref} className={`text-pressure ${className}`.trim()} style={style} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </Tag>
  );
}
