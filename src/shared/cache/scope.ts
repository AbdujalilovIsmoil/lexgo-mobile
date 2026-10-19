// Every row belongs to the signed-in user. The id is set by core/cache (CacheMount) and is "" while
// signed out; an empty scope reads nothing and writes nothing, so one account never sees another's data.
let current = "";
// Bumped whenever the scope changes or the cache is wiped (sign-out, role change). Long async jobs (restore,
// debounced snapshot writes, the outbox flush) note it when they start and stop as soon as it moved: work begun
// for one account or role must never land in the next one's cache or be sent with the next one's token.
let epoch = 0;

export const cacheScope = (): string => current;
export const cacheEpoch = (): number => epoch;
export const bumpCacheEpoch = (): void => {
  epoch += 1;
};

export function setCacheScope(userId: string): void {
  if (userId !== current) epoch += 1;
  current = userId;
}

/** True while the scope/epoch noted at the start of a job are still the live ones. */
export const sameCacheEpoch = (scope: string, at: number): boolean => scope !== "" && scope === current && at === epoch;
