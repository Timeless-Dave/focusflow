import { useEffect } from 'react';
import { SECTION_ROUTES } from '@/lib/routes';

export function useSectionScroll(pathname, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const sectionId = SECTION_ROUTES[pathname];
    if (!sectionId) return;

    // Double-rAF: ensures React has finished painting before scroll
    let f1, f2;
    f1 = requestAnimationFrame(() => {
      f2 = requestAnimationFrame(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'instant', block: 'start' });
      });
    });

    return () => { cancelAnimationFrame(f1); cancelAnimationFrame(f2); };
  }, [pathname, enabled]);
}
