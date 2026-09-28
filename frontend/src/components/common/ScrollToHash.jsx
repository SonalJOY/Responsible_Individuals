import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToHash listens to pathname and hash changes across the application.
 * When a hash anchor is provided (e.g. #vision, #approach, #leadership),
 * it smoothly scrolls to the target element taking scroll-margin-top into account.
 * When a top-level route is loaded without a hash, it smoothly resets scroll to the top.
 */
export default function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const scrollToElement = () => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          return true;
        }
        return false;
      };

      // Attempt immediate scroll
      if (!scrollToElement()) {
        // Fallback retry to handle asynchronous mount / image / font layout render
        const timer1 = setTimeout(scrollToElement, 60);
        const timer2 = setTimeout(scrollToElement, 200);
        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname, hash]);

  return null;
}
