import { useEffect } from 'react';
import { SECTION_ROUTES } from '@/lib/routes';

export function useSectionScroll(pathname, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const sectionId = SECTION_ROUTES[pathname];
    if (!sectionId) return;

    const frame = requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    return () => cancelAnimationFrame(frame);
  }, [pathname, enabled]);
}
