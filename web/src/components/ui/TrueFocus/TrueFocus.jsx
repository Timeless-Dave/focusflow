import { useCallback, useState } from 'react';

import './TrueFocus.css';

/**
 * Highlights focused words/phrases — siblings blur slightly on hover.
 */
export default function TrueFocus({
  phrases,
  className = '',
  blurInactivePx = '4px',
  as: Tag = 'span'
}) {
  const [active, setActive] = useState(null);

  const onEnter = useCallback(i => () => setActive(i), []);
  const onLeave = useCallback(() => setActive(null), []);

  return (
    <Tag className={`true-focus ${className}`.trim()}>
      {phrases.map((text, i) => (
        <button
          key={text}
          type="button"
          className="true-focus__chip"
          data-active={active === null || active === i}
          style={{
            '--tf-blur': blurInactivePx
          }}
          onMouseEnter={onEnter(i)}
          onMouseLeave={onLeave}
          onFocus={onEnter(i)}
          onBlur={onLeave}
        >
          {text}
        </button>
      ))}
    </Tag>
  );
}
