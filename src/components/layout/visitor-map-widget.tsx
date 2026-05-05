import { useEffect, useRef } from "react";

const CLUSTRMAPS_SCRIPT_ID = "clustrmaps";
const CLUSTRMAPS_SCRIPT_SRC =
  "https://cdn.clustrmaps.com/map_v2.js?cl=ffffff&w=a&t=tt&d=JAiyy3SIEEXGNMaZse8-UzAU4R0tl5U9fGNVrcY3FC4";

export function VisitorMapWidget() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (container.querySelector(`#${CLUSTRMAPS_SCRIPT_ID}`)) return;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.id = CLUSTRMAPS_SCRIPT_ID;
    script.src = CLUSTRMAPS_SCRIPT_SRC;

    container.appendChild(script);
  }, []);

  return (
    <div
      ref={containerRef}
      className="inline-block max-w-full"
      style={{ width: "300px", maxWidth: "100%" }}
    />
  );
}
