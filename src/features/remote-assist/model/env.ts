import type { RaMeta } from "@/entities/remote-assist";

// What the session machinery reads from React land, kept current by the host (useRaHost): the screen in front, whether the app is in
// front and unlocked, the runtime contract and the navigation container (for "is a call open?").
type NavRef = { isReady?: () => boolean; getRootState?: () => unknown };

export const env = {
  on: false, // a signed-in client's host is mounted
  pathname: "/",
  active: true,
  locked: false,
  meta: (): RaMeta | null => null,
  loadMeta: async (): Promise<RaMeta | null> => null,
  nav: null as NavRef | null,
};

/** The app is in front and unlocked: the only time commands run (TZ RA §22). */
export const awake = (): boolean => env.active && !env.locked;
