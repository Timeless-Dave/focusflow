import { useCallback, useEffect, useRef, useState } from 'react';

import './ImageTrail.css';

let trailKey = 0;
function nextId() {
  trailKey += 1;
  return trailKey;
}

export default function ImageTrail({ imageUrl, maxPoints = 10, size = 48, decay = 0.88, className = '' }) {
  const wrapRef = useRef(null);
  const [trail, setTrail] = useState([]);

  const tick = useCallback(() => {
    setTrail(points => points.map(p => ({ ...p, o: p.o * decay })).filter(p => p.o > 0.04));
  }, [decay]);

  useEffect(() => {
    const id = window.setInterval(tick, 90);
    return () => window.clearInterval(id);
  }, [tick]);

  const onMove = useCallback(
    e => {
      const shell = wrapRef.current;
      if (!shell || !imageUrl) return;

      const r = shell.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
        return;

      const x = e.clientX - r.left;

      setTrail(points => [...points.slice(-maxPoints + 1), { id: nextId(), x, o: 1 }]);
    },
    [imageUrl, maxPoints]
  );

  const onLeave = useCallback(() => setTrail([]), []);

  return (
    <div
      ref={wrapRef}
      className={`image-trail ${className}`.trim()}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-hidden="true"
    >
      <div className="image-trail__layer">
        {trail.map(p => (
          <span
            key={p.id}
            className="image-trail__spot"
            style={{
              '--ix': `${p.x}px`,
              opacity: p.o,
              backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
              width: `${size}px`,
              height: `${size}px`
            }}
          />
        ))}
      </div>
    </div>
  );
}
