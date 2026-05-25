import './LogoLoop.css';

function LogoItem({ item }) {
  return (
    <span className="logo-loop__item">
      {item.image ? (
        <span className="logo-loop__logo-wrap">
          <img src={item.image} alt="" className="logo-loop__img" loading="lazy" decoding="async" />
        </span>
      ) : item.icon ? (
        <span className="logo-loop__icon" style={item.color ? { background: item.color } : undefined}>
          {item.icon}
        </span>
      ) : null}
      <span className="logo-loop__label">{item.label}</span>
    </span>
  );
}

export default function LogoLoop({ items = [], reverse = false, className = '' }) {
  const renderGroup = (prefix) => (
    <div className="logo-loop__group" aria-hidden={prefix === 'b' ? true : undefined}>
      {items.map((item) => (
        <LogoItem key={`${prefix}-${item.label}`} item={item} />
      ))}
    </div>
  );

  return (
    <div
      className={`logo-loop ${reverse ? 'logo-loop--reverse' : ''} ${className}`.trim()}
      aria-label="Partner platforms"
    >
      <div className="logo-loop__track">
        {renderGroup('a')}
        {renderGroup('b')}
      </div>
    </div>
  );
}
