import './Cubes.css';

export default function Cubes({ count = 4, className = '' }) {
  const blocks = Array.from({ length: count }, (_, i) => i);

  return (
    <div className={`cubes-root ${className}`.trim()} aria-hidden="true">
      <div className="cubes-scene">
        {blocks.map(i => (
          <div key={i} className={`cubes-stack cubes-stack--${i}`}>
            <div className="cubes-cube cubes-cube-a" />
            <div className="cubes-cube cubes-cube-b" />
          </div>
        ))}
      </div>
    </div>
  );
}
