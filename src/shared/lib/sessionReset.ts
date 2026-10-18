// Anything that keeps user-specific data outside React Query (zustand stores,
// local DB rows, file caches) registers a cleaner here. It runs on logout and
// whenever the signed-in user or role context changes (TZ 45.9), so one role's
// data never shows up in another's session.
const cleaners = new Set<() => void>();

export function registerSessionReset(fn: () => void): () => void {
  cleaners.add(fn);
  return () => void cleaners.delete(fn);
}

export function runSessionReset(): void {
  for (const fn of cleaners) {
    try {
      fn();
    } catch {
      /* a failing cleaner must not block the others */
    }
  }
}
