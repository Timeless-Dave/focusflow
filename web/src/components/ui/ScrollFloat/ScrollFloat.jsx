import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import './ScrollFloat.css';

/** Float children into place on scroll via ScrollTrigger. */
export default function ScrollFloat({
  children,
  className = '',
  as: Tag = 'div',
  y = 32,
  duration = 0.85,
  ease = 'power2.out'
}) {
  const ref = useRef(null);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      if (!ref.current) return;

      gsap.fromTo(
        ref.current,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration,
          ease,
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 88%',
            once: true
          }
        }
      );
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={`scroll-float ${className}`.trim()}>
      {children}
    </Tag>
  );
}
