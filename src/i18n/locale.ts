import { useLocation } from "react-router-dom";

export type Locale = "en" | "zh";

const ZH_PREFIX = "/zh";

export const getLocaleFromPathname = (pathname: string): Locale =>
  pathname === ZH_PREFIX || pathname.startsWith(`${ZH_PREFIX}/`) ? "zh" : "en";

export const stripLocalePrefix = (pathname: string) => {
  if (pathname === ZH_PREFIX) return "/";
  if (pathname.startsWith(`${ZH_PREFIX}/`)) {
    return pathname.slice(ZH_PREFIX.length) || "/";
  }
  return pathname || "/";
};

export const localizePath = (path: string, locale: Locale) => {
  const [pathAndSearch, hash = ""] = path.split("#", 2);
  const [pathname, search = ""] = pathAndSearch.split("?", 2);
  const basePath = stripLocalePrefix(pathname || "/");
  const localizedPathname =
    locale === "zh" ? (basePath === "/" ? ZH_PREFIX : `${ZH_PREFIX}${basePath}`) : basePath;

  return `${localizedPathname}${search ? `?${search}` : ""}${hash ? `#${hash}` : ""}`;
};

export const useLocale = () => {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const pathWithoutLocale = stripLocalePrefix(location.pathname);
  const basePathname =
    pathWithoutLocale.length > 1 && pathWithoutLocale.endsWith("/")
      ? pathWithoutLocale.slice(0, -1)
      : pathWithoutLocale;
  const alternateLocale: Locale = locale === "zh" ? "en" : "zh";
  const alternatePath = `${localizePath(basePathname, alternateLocale)}${location.search}${location.hash}`;

  return {
    locale,
    isZh: locale === "zh",
    basePathname,
    localize: (path: string) => localizePath(path, locale),
    alternateLocale,
    alternatePath,
  };
};
