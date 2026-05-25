import './FeatureMarquee.css';

/**
 * Full-bleed horizontal marquee with icon + label chips (edge-to-edge loop).
 */
export default function FeatureMarquee({ items = [], reverse = false, className = '' }) {
  const track = [...items, ...items];

  return (
    <div
      className={`feature-marquee ${reverse ? 'feature-marquee--reverse' : ''} ${className}`.trim()}
      aria-hidden="true"
    >
      <div className="feature-marquee__track">
        {track.map((item, i) => (
          <span key={`${item.id ?? item.label}-${i}`} className="feature-marquee__chip">
            {item.image ? (
              <img src={item.image} alt="" className="feature-marquee__img" loading="lazy" />
            ) : item.icon ? (
              <span className="feature-marquee__icon" style={item.color ? { background: item.color } : undefined}>
                {item.icon}
              </span>
            ) : null}
            <span className="feature-marquee__label">{item.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
