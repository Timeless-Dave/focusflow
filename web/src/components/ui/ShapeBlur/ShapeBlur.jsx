import './ShapeBlur.css';

export default function ShapeBlur({
  className = '',
  scale = 1.15,
  opacity = 0.55,
  hueRotate = '260deg'
}) {
  return (
    <div
      className={`shape-blur ${className}`.trim()}
      aria-hidden="true"
      style={{
        opacity,
        transform: `scale(${scale})`,
        filter: `hue-rotate(${hueRotate})`
      }}
    >
      <div className="shape-blur__blob shape-blur__blob-a" />
      <div className="shape-blur__blob shape-blur__blob-b" />
      <div className="shape-blur__grain" />
    </div>
  );
}
