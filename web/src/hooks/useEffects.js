import { useEffect } from 'react';

export function useScrollReveal(selector = '.reveal', enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    const markVisible = (el) => el.classList.add('visible');

    if (!('IntersectionObserver' in window)) {
      elements.forEach(markVisible);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            markVisible(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => {
      if (el.classList.contains('visible')) return;

      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        markVisible(el);
        return;
      }

      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [selector, enabled]);
}

export function useStickyHeader() {
  useEffect(() => {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}
