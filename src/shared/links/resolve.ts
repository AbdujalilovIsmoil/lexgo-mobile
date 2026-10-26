import { appHref } from "./appRoutes";
import { parseExternal } from "./external";
import { mayOpen, safeHome } from "./guard";
import { routeFor } from "./routes";
import { subjectOf } from "./subject";
import { webToApp } from "./web";
import type { LinkInput, Resolution, Target, Viewer } from "./types";

const LISTS: Record<string, [client: string, seller: string]> = {
  orders: ["/orders", "/pro/orders"],
  payments: ["/payments", "/payments"],
  documents: ["/documents", "/pro/docs"],
  chat: ["/(tabs)/messages", "/(tabs)/messages"],
};

const listFor = (category: string | undefined, v: Viewer): Target | null => {
  const pair = category ? LISTS[category] : undefined;
  const href = pair ? pair[v.kind === "seller" ? 1 : 0] : "";
  return href ? { href, fallback: href, label: "list" } : null;
};

function guarded(t: Target, v: Viewer): Resolution {
  if (!mayOpen(t.href, v)) return { kind: "blocked", fallback: safeHome(v) };
  return { kind: "target", target: mayOpen(t.fallback, v) ? t : { ...t, fallback: safeHome(v) } };
}

/** A `lexgo://…` or https link (or a path) → a target. Unknown / foreign links are blocked, never opened. */
export function resolveUrl(raw: string, v: Viewer): Resolution {
  const p = parseExternal(raw);
  const href = p ? (p.web ? webToApp(p.path, p.query, v) : appHref(p.path, p.query)) : null;
  return href ? guarded({ href, fallback: href, label: "link" }, v) : { kind: "blocked", fallback: safeHome(v) };
}

/** A notification / push payload → the screen it opens for THIS viewer (TZ 28: role and ownership aware). */
export function resolveLink(input: LinkInput, v: Viewer): Resolution {
  const link = input.deepLink?.trim();
  if (link) {
    const r = resolveUrl(link, v);
    if (r.kind === "target") return r;
  }
  const s = subjectOf(input);
  const t = s ? routeFor(s, v) : null;
  if (t) return guarded(t, v);
  const list = listFor(input.category, v);
  return list ? guarded(list, v) : { kind: "none" };
}
