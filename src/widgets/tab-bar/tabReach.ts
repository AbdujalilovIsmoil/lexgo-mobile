import { Platform } from "react-native";
import { router } from "expo-router";

// The system tab bar (NativeTabs) can only reach the tabs it shows: a tab marked `hidden` cannot be navigated to at all. Many
// links point at tab pages that are not in the current role's bar (the profile, lawyers, orders, a client's works…), so on iOS
// every `/(tabs)/<name>` the bar does not show opens the same page as an ordinary stack screen, `/m/<name>`.
let bar: string[] = [];
export const setBarRoutes = (routes: string[]) => { bar = routes; };

const rewritePath = (path: string): string => {
  const m = /^\/\(tabs\)\/([a-z]+)(.*)$/.exec(path);
  return m && !bar.includes(m[1]) ? `/m/${m[1]}${m[2]}` : path;
};
const rewrite = (href: unknown): unknown => {
  if (typeof href === "string") return rewritePath(href);
  const o = href as { pathname?: unknown } | null;
  return o && typeof o === "object" && typeof o.pathname === "string" ? { ...o, pathname: rewritePath(o.pathname) } : href;
};

let installed = false;
export function installTabReach() {
  if (installed || Platform.OS !== "ios") return;
  installed = true;
  for (const k of ["navigate", "push", "replace"] as const) {
    const orig = router[k] as (href: never, options?: never) => void;
    (router as Record<string, unknown>)[k] = (href: never, options?: never) => orig(rewrite(href) as never, options);
  }
}
