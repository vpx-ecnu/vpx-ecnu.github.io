import type {
  FocusEventHandler,
  MouseEventHandler,
  TouchEventHandler,
} from "react";
import { Link, type LinkProps } from "react-router-dom";
import { preloadRoute } from "@/lib/route-preload";

type PreloadLinkProps = LinkProps;

const resolvePreloadTarget = (to: LinkProps["to"]) => {
  if (typeof to === "string") {
    return to;
  }

  if (!to || typeof to !== "object") {
    return null;
  }

  const pathname = to.pathname ?? "";
  const search = to.search ?? "";
  const hash = to.hash ?? "";

  return `${pathname}${search}${hash}`;
};

export function PreloadLink({
  to,
  onMouseEnter,
  onFocus,
  onTouchStart,
  ...props
}: PreloadLinkProps) {
  const preloadTarget = resolvePreloadTarget(to);

  const handlePreload = () => {
    if (preloadTarget) {
      preloadRoute(preloadTarget);
    }
  };

  const handleMouseEnter: MouseEventHandler<HTMLAnchorElement> = (event) => {
    handlePreload();
    onMouseEnter?.(event);
  };

  const handleFocus: FocusEventHandler<HTMLAnchorElement> = (event) => {
    handlePreload();
    onFocus?.(event);
  };

  const handleTouchStart: TouchEventHandler<HTMLAnchorElement> = (event) => {
    handlePreload();
    onTouchStart?.(event);
  };

  return (
    <Link
      {...props}
      to={to}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      onTouchStart={handleTouchStart}
    />
  );
}
