import { usePendingLink } from "@/features/open-link";
import { parseExternal } from "@/shared/links";

const DEV_LAUNCHER = /^exp\+?[a-z0-9-]*:\/\/|expo-development-client/i;

/**
 * The body of app/+native-intent.ts. expo-router calls it with every incoming URL (cold start:
 * `initial`, warm start: not). A `lexgo://…` or https://lexgo.uz/… link is NOT navigated here: it is
 * queued and LinkMount opens it once the session and the navigator are ready, through the same
 * role-aware, resource-checked path as a notification tap. The icon launch ("/") passes through; the
 * dev-client launcher link is left alone.
 */
export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }): string | null {
  if (DEV_LAUNCHER.test(path)) return path;
  const parsed = parseExternal(path);
  if (parsed && parsed.path === "/" && !parsed.web) return path;
  usePendingLink.getState().set({ url: path });
  return initial ? "/" : null;
}
