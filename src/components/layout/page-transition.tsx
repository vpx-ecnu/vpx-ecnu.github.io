
import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (location !== displayLocation) {
      setIsTransitioning(true);
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setIsTransitioning(false);
      }, 200); // Short timeout for a quick transition
      
      return () => clearTimeout(timeout);
    }
  }, [location, displayLocation]);

  return (
    <div
      className={`min-h-[calc(100vh-8rem)] transition-opacity duration-200 ease-in-out ${
        isTransitioning ? "opacity-0" : "opacity-100"
      }`}
    >
      {children}
    </div>
  );
}
