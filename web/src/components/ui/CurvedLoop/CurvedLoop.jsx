import './CurvedLoop.css';

export default function CurvedLoop({ text, className = '' }) {
  const doubled = `${text.trim()} `.repeat(2);

  return (
    <div className={`curved-loop ${className}`.trim()} aria-hidden="true">
      <div className="curved-loop__mask">
        <div className="curved-loop__track">
          <span>{doubled}</span>
          <span>{doubled}</span>
        </div>
      </div>
    </div>
  );
}
