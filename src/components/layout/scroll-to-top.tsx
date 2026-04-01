import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const location = useLocation();
  const previousPathname = useRef(location.pathname);

  useLayoutEffect(() => {
    const pathnameChanged = previousPathname.current !== location.pathname;
    previousPathname.current = location.pathname;

    if (!pathnameChanged || location.hash) {
      return;
    }

    window.scrollTo(0, 0);
  }, [location.hash, location.pathname]);

  return null;
}
