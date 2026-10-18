import { RULES } from "./routeRules";

export const normalizeHref = (raw: string, aliases: Record<string, string> = {}): string => {
  const path = (raw || "").split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  return aliases[path] ?? path;
};

// "/portal/client/subscriptions" → "/subscription"; null when the app has no equivalent screen.
export function mobileRoute(raw: string, aliases: Record<string, string> = {}): string | null {
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  const path = normalizeHref(raw, aliases);
  const ticket = /[?&]ticket=([\w-]+)/.exec(raw)?.[1];
  for (const [re, to] of RULES) {
    const m = path.match(re);
    if (!m) continue;
    const route = typeof to === "function" ? to(m) : to.replace("$1", m[1] ?? "");
    return route === "/support" && ticket ? `/support/${ticket}` : route;
  }
  return null;
}

// The contract's allowed_routes are prefixes (never the bare role root, which would allow everything).
export function hrefAllowed(raw: string, allowed: string[], aliases: Record<string, string> = {}): boolean {
  if (!allowed.length) return true;
  const path = normalizeHref(raw, aliases);
  return allowed.some((a) => {
    const base = normalizeHref(a, aliases);
    return path === base || (!/^\/portal\/[^/]+$|^\/admin$/.test(base) && path.startsWith(`${base}/`));
  });
}
