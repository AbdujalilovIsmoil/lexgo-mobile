// Every row belongs to the signed-in user. The id is set by core/cache (CacheMount) and is "" while
// signed out; an empty scope reads nothing and writes nothing, so one account never sees another's data.
let current = "";

export const cacheScope = (): string => current;
export function setCacheScope(userId: string): void {
  current = userId;
}
