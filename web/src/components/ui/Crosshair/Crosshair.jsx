import { useEffect, useMemo, useState } from 'react';

import './Crosshair.css';

export default function Crosshair({ boundsRef, thickness = 1, color = 'rgba(167,139,250,0.35)', className = '' }) {
  const [{ x, y, active }, setState] = useState({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const root = boundsRef?.current;

    const move = ev => {
      if (!boundsRef?.current) return;

      const r = boundsRef.current.getBoundingClientRect();
      const inside =
        ev.clientX >= r.left &&
        ev.clientX <= r.right &&
        ev.clientY >= r.top &&
        ev.clientY <= r.bottom;

      if (!inside) {
        setState(prev => ({ ...prev, active: false, x: -9999, y: -9999 }));
        return;
      }

      setState({
        active: true,
        x: ev.clientX - r.left,
        y: ev.clientY - r.top
      });
    };

    const leave = () =>
      setState({
        active: false,
        x: -9999,
        y: -9999
      });

    if (root) {
      root.addEventListener('pointermove', move);
      root.addEventListener('pointerleave', leave);
    }

    return () => {
      if (root) {
        root.removeEventListener('pointermove', move);
        root.removeEventListener('pointerleave', leave);
      }
    };
  }, [boundsRef]);

  const style = useMemo(
    () => ({
      '--ch-x': `${x}px`,
      '--ch-y': `${y}px`,
      '--ch-thick': `${thickness}px`,
      '--ch-color': color
    }),
    [x, y, thickness, color]
  );

  return (
    <div
      className={`crosshair-mount ${active ? 'crosshair-mount--active' : ''} ${className}`.trim()}
      aria-hidden="true"
      style={style}
    >
      <span className="crosshair-lines" />
    </div>
  );
}
