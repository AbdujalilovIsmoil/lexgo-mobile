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

// Work that needs the session's token and so must finish BEFORE a deliberate sign-out wipes it (e.g. telling the backend to stop pushing
// to this phone). Each runs at most 3 s: a slow network must not hold the sign-out.
const before = new Set<() => Promise<void>>();

export function registerBeforeSignOut(fn: () => Promise<void>): () => void {
  before.add(fn);
  return () => void before.delete(fn);
}

export async function runBeforeSignOut(): Promise<void> {
  const wait = new Promise<void>((r) => setTimeout(r, 3000));
  await Promise.race([Promise.allSettled([...before].map((fn) => fn())).then(() => undefined), wait]);
}
