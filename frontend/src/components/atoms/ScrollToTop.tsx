import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function scrollToTarget(hash: string): boolean {
  if (!hash) return false;
  const el = document.getElementById(hash.replace('#', ''));
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
    return true;
  }
  return false;
}

export function ScrollToTop(): null {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!scrollToTarget(hash)) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return null;
}
