import { useEffect, useState } from "react";

interface DelayedRouteFallbackProps {
  delayMs?: number;
}

export function DelayedRouteFallback({
  delayMs = 120,
}: DelayedRouteFallbackProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsVisible(true);
    }, delayMs);

    return () => window.clearTimeout(timeout);
  }, [delayMs]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="container px-4 py-12 md:px-6" role="status" aria-live="polite">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-full animate-pulse rounded-md bg-muted/80" />
        <div className="h-4 w-5/6 animate-pulse rounded-md bg-muted/80" />
        <div className="h-36 animate-pulse rounded-2xl bg-muted/60" />
      </div>
      <span className="sr-only">Loading page</span>
    </div>
  );
}
