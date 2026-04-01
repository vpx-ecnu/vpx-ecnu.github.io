const routeLoaders = {
  "/about": () => import("@/pages/About"),
  "/projects": () => import("@/pages/Projects"),
  "/publications": () => import("@/pages/Publications"),
  "/people": () => import("@/pages/People"),
  "/activities": () => import("@/pages/Activities"),
  "/join": () => import("@/pages/Join"),
  "/intranet": () => import("@/pages/Intranet"),
  "/studio/news": () => import("@/pages/StudioNews"),
} as const;

const routeCache = new Map<string, Promise<unknown>>();

const normalizeRoutePath = (to: string) => {
  const [pathWithoutHash] = to.split("#");
  const [pathWithoutSearch] = pathWithoutHash.split("?");
  const normalizedPath = pathWithoutSearch || "/";

  if (normalizedPath.length > 1 && normalizedPath.endsWith("/")) {
    return normalizedPath.slice(0, -1);
  }

  return normalizedPath;
};

export const routeModuleLoaders = {
  about: routeLoaders["/about"],
  projects: routeLoaders["/projects"],
  publications: routeLoaders["/publications"],
  people: routeLoaders["/people"],
  activities: routeLoaders["/activities"],
  join: routeLoaders["/join"],
  intranet: routeLoaders["/intranet"],
  studioNews: routeLoaders["/studio/news"],
};

export function preloadRoute(to: string) {
  const routePath = normalizeRoutePath(to);
  const loader = routeLoaders[routePath as keyof typeof routeLoaders];

  if (!loader) return undefined;
  if (!routeCache.has(routePath)) {
    routeCache.set(routePath, loader());
  }

  return routeCache.get(routePath);
}
