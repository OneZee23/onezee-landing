import { useEffect, useRef, useState } from 'react';

/**
 * Adds a scroll-reveal effect: returns a ref + a boolean that flips to true
 * the first time the element scrolls into view. Pair with the `.reveal` CSS class.
 * Degrades gracefully if IntersectionObserver is unavailable.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}
