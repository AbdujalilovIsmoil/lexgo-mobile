import { usePendingLink } from "@/features/open-link";
import { parseExternal } from "@/shared/links";

// The dev-client launcher's own links (development builds only). Anchored: an unanchored "expo-development-client" let any link that
// merely contained the words — `lexgo://manage/x?a=expo-development-client` — skip the allow list, the role guard and the sign-in queue.
const DEV_LAUNCHER = /^(exp\+[a-z0-9-]*:\/\/|[a-z][a-z0-9+.-]*:\/\/expo-development-client\/)/i;

/**
 * The body of app/+native-intent.ts. expo-router calls it with every incoming URL (cold start:
 * `initial`, warm start: not). A `lexgo://…` or https://lexgo.uz/… link is NOT navigated here: it is
 * queued and LinkMount opens it once the session and the navigator are ready, through the same
 * role-aware, resource-checked path as a notification tap. The icon launch ("/") passes through; in a
 * development build the dev-client launcher link is left alone.
 */
export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }): string | null {
  if (__DEV__ && DEV_LAUNCHER.test(path)) return path;
  const parsed = parseExternal(path);
  if (parsed && parsed.path === "/" && !parsed.web) return path;
  // expo-router asks while it renders the navigator: storing the link right now would update LinkMount in the middle
  // of that render (React: "Cannot update a component while rendering a different component"). Queue it a tick later.
  setTimeout(() => usePendingLink.getState().set({ url: path }), 0);
  return initial ? "/" : null;
}
