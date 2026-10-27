// The client screens remote assistance knows (TZ RA §18). Page ids follow the web client's registry, so the operator's console names
// them; `tab` marks a screen that lives in the tab bar. A route that is not here is never opened — sign-in, payments, security, identity,
// settings, the call screen, the professional's area, links outside the app and anything malformed are simply absent.
const ID = "[A-Za-z0-9_-]{1,80}";
const APP: [RegExp, string, boolean?][] = [
  [/^\/$/, "client.dashboard", true],
  [/^\/ai$/, "client.ai", true],
  [/^\/services$/, "client.documents", true],
  [new RegExp(`^/services/${ID}$`), "client.documents.item"],
  [/^\/works$/, "client.my_works", true],
  [new RegExp(`^/works/${ID}$`), "client.my_works"],
  [/^\/messages$/, "client.messages", true],
  [/^\/lawyers$/, "client.marketplace", true],
  [/^\/marketplace$/, "client.marketplace", true], // redirects into the Lawyers tab
  [new RegExp(`^/specialist/${ID}$`), "client.marketplace.seller"],
  [/^\/orders$/, "client.marketplace.orders", true],
  [new RegExp(`^/orders/${ID}$`), "client.marketplace.orders"],
  [/^\/matches$/, "client.matches"],
  [/^\/packages$/, "client.packages"],
  [/^\/ratings$/, "client.reviews"],
  [/^\/warranty$/, "client.warranty"],
  [/^\/profile$/, "client.profile", true],
  [/^\/profile\/edit$/, "client.profile"],
  [/^\/profile\/referral$/, "client.referrals"],
  [/^\/profile\/gifts$/, "client.gifts"],
  [/^\/subscription$/, "client.subscription"],
  [/^\/subscriptions$/, "client.subscriptions"],
  [/^\/support$/, "client.support"],
  [new RegExp(`^/support/${ID}$`), "client.support"],
  [/^\/documents$/, "client.my_documents"],
  [new RegExp(`^/documents/${ID}$`), "client.my_documents"],
  [/^\/notifications$/, "client.notifications"],
  [/^\/academy$/, "client.academy"],
  [/^\/doc-analysis$/, "client.doc_analysis"],
  [/^\/cases$/, "client.cases"],
  [/^\/intake$/, "client.intake"],
  [/^\/urgent$/, "client.urgent_lawyer"],
  [new RegExp(`^/urgent/${ID}$`), "client.urgent_lawyer"],
  [/^\/sos$/, "client.sos"],
  [/^\/team-tasks$/, "client.team_tasks"],
  [/^\/complaints$/, "client.complaints"],
];

// The web client's routes (what the operator's console sends) → this app's screen.
type To = string | ((m: RegExpMatchArray) => string);
const C = "/portal/client";
const WEB: [RegExp, To][] = [
  [new RegExp(`^${C}$`), "/"],
  [new RegExp(`^${C}/ai(?:-help)?$`), "/ai"],
  [new RegExp(`^${C}/(notifications|academy|messages|services|documents|doc-analysis|cases|intake|works|sos|matches|packages|warranty|profile|subscription|subscriptions|team-tasks|support|complaints)$`), (m) => `/${m[1]}`],
  [new RegExp(`^${C}/services/(?:document|template)/(${ID})$`), (m) => `/services/${m[1]}`],
  [new RegExp(`^${C}/(works|support)/(${ID})$`), (m) => `/${m[1]}/${m[2]}`],
  [new RegExp(`^${C}/urgent(?:-advokat)?$`), "/urgent"],
  [new RegExp(`^${C}/(?:lawyers|marketplace)$`), "/lawyers"],
  [new RegExp(`^(?:${C})?/lawyers/(${ID})$`), (m) => `/specialist/${m[1]}`],
  [new RegExp(`^${C}/marketplace-orders$`), "/orders"],
  [new RegExp(`^${C}/marketplace-orders/(${ID})$`), (m) => `/orders/${m[1]}`],
  [new RegExp(`^${C}/reviews$`), "/ratings"],
  [new RegExp(`^${C}/referrals$`), "/profile/referral"],
  [new RegExp(`^${C}/gifts$`), "/profile/gifts"],
];

// Query keys a target may keep (the support hub's "new chat" window, a search); everything else in a query is dropped.
const QUERY: Record<string, string[]> = { "/support": ["new", "topic"], "/lawyers": ["q"], "/services": ["q"] };

const SAFE = /^\/[A-Za-z0-9/_-]*(\?[A-Za-z0-9=&_.%-]*)?$/;
const LOCALE = /^\/(uz|ru|en)(?=\/|$)/;

export type RaPlace = { pageId: string; route: string; tab: boolean };
export type RaTarget = RaPlace & { href: string };

const strip = (path: string): string => path.replace(/\/+$/, "") || "/";

function row(path: string): RaPlace | null {
  const hit = APP.find(([re]) => re.test(path));
  return hit ? { pageId: hit[1], route: path, tab: !!hit[2] } : null;
}

function fromWeb(path: string): string | null {
  for (const [re, to] of WEB) {
    const m = path.match(re);
    if (m) return typeof to === "string" ? to : to(m);
  }
  return null;
}

function keptQuery(path: string, query: string): string {
  const keys = QUERY[path] ?? [];
  const kept = query.split("&").filter((p) => keys.includes(p.split("=")[0]) && /^[\w-]+=[\w.%-]{0,80}$/.test(p));
  return kept.length ? `?${kept.join("&")}` : "";
}

/** The screen an operator's route.navigate may open, or null when it is not an allowed client route (TZ RA §18). */
export function raTarget(raw: unknown): RaTarget | null {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (!s || s.length > 500 || !SAFE.test(s) || s.startsWith("//") || s.includes("..") || /%2f|%5c|%2e/i.test(s)) return null;
  const [p, q = ""] = s.split("?");
  const path = strip(p.replace(LOCALE, ""));
  const app = row(path) ? path : fromWeb(path);
  const place = app ? row(app) : null;
  return place ? { ...place, href: place.route + keptQuery(place.route, q) } : null;
}

// iOS opens a tab page the system bar does not show as `/m/<name>` (widgets/tab-bar/tabReach): it is the same screen.
const canonical = (path: string): string => {
  const m = /^\/m\/([a-z]+)$/.exec(path);
  return m ? (m[1] === "index" ? "/" : `/${m[1]}`) : path;
};

/** Where the client is, for the published state: a known page, or `client.outside` with the bare path (no query, no ids added). */
export function raPlaceOf(pathname: string): RaPlace {
  const path = canonical(strip(pathname.split(/[?#]/)[0] || "/"));
  return row(path) ?? { pageId: "client.outside", route: path.slice(0, 500), tab: false };
}
