import { Platform } from "react-native";
import { router } from "expo-router";

// The system tab bar (NativeTabs) can only reach the tabs it shows: a tab marked `hidden` cannot be navigated to at all. Many
// links point at tab pages that are not in the current role's bar (the profile, lawyers, orders, a client's works…), so on iOS
// every `/(tabs)/<name>` the bar does not show opens the same page as an ordinary stack screen, `/m/<name>`.
let bar: string[] = [];
export const setBarRoutes = (routes: string[]) => { bar = routes; };

// The tab pages (app/(tabs)/*.tsx apart from the home): a bare "/orders" or "/lawyers" (the sidebar writes them so) reaches the same screen
// as "/(tabs)/orders", so it is rewritten the same way — only the exact path: "/orders/<id>" and "/services/<id>" are real stack screens.
const TAB_PAGES = new Set(["services", "works", "messages", "workspace", "requests", "clients", "leads", "csupport", "cclients", "cmeetings", "pipeline", "duty", "smeetings", "canalytics", "lawyers", "orders", "admin", "hrm", "notifs", "profile", "ai"]);

export const rewritePath = (path: string): string => {
  const m = /^\/\(tabs\)\/([a-z]+)(.*)$/.exec(path);
  if (m) return !bar.includes(m[1]) ? `/m/${m[1]}${m[2]}` : path;
  const b = /^\/([a-z]+)(\?.*)?$/.exec(path);
  return b && TAB_PAGES.has(b[1]) && !bar.includes(b[1]) ? `/m/${b[1]}${b[2] ?? ""}` : path;
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
