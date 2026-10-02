export const normalizeRoute = (route: string): string => {
  if (route.startsWith('/')) {
    return route;
  }
  return `/${route}`;
};
