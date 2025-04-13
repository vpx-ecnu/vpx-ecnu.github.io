import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [currentChildren, setCurrentChildren] = useState(children); // 存储当前显示的children
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (location !== displayLocation) {
      setIsTransitioning(true);
      const timeout = setTimeout(() => {
        // 动画完成后更新显示内容和位置
        setDisplayLocation(location);
        setCurrentChildren(children);
        setIsTransitioning(false);
      }, 200); // 确保这个时长与CSS过渡时间一致

      return () => clearTimeout(timeout);
    }
  }, [location, displayLocation, children]);

  return (
    <div
      className={`min-h-[calc(100vh-8rem)] transition-opacity duration-200 ease-in-out ${
        isTransitioning ? "opacity-0" : "opacity-100"
      }`}
    >
      {currentChildren} {/* 渲染存储的children */}
    </div>
  );
}