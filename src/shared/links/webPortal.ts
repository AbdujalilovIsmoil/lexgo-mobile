import { enc, type Viewer } from "./types";

export type Q = Record<string, string>;
export type Rule = [RegExp, (m: RegExpExecArray, q: Q, v: Viewer) => string | null];

const sel = (v: Viewer, client: string, seller: string): string => (v.kind === "seller" ? seller : client);

// Portal pages of the website (law-main/app/[locale]/portal/<role>/…) → app screens. The role in the
// URL is ignored: the viewer's own role decides which app screen shows the same thing.
export const PORTAL: Rule[] = [
  [/^$/, () => "/"],
  [/^notifications$/, () => "/notifications"],
  [/^(messages|chat)$/, () => "/(tabs)/messages"],
  [/^documents$/, (_m, q) => (q.doc ? `/documents/${enc(q.doc)}` : "/documents")],
  [/^document-requests$/, () => "/pro/docs"],
  [/^document-requests\/([^/]+)\/editor$/, (m) => `/pro/docs/${enc(m[1])}/editor`],
  [/^opportunities$/, () => "/pro/market"],
  [/^cases$/, (_m, _q, v) => sel(v, "/cases", "/pro/cases")],
  [/^works$/, () => "/(tabs)/works"],
  [/^payments$/, () => "/payments"],
  [/^marketplace-orders$/, (_m, _q, v) => sel(v, "/orders", "/pro/orders")],
  [/^support$/, (_m, q) => (q.ticket ? `/support/${enc(q.ticket)}` : "/support")],
  [/^support\/([^/]+)$/, (m) => `/support/${enc(m[1])}`],
  [/^(urgent|urgent-advokat)$/, (_m, _q, v) => sel(v, "/urgent", "/pro/urgent")],
  [/^sos$/, (_m, _q, v) => sel(v, "/sos", "/pro/urgent")],
  [/^intake$/, () => "/intake"],
  [/^matches$/, () => "/matches"],
  [/^complaints$/, (_m, q) => (q.work ? `/rate/${enc(q.work)}` : "/(tabs)/works")],
  [/^(subscription|subscriptions|packages)$/, () => "/subscription"],
  [/^profile$/, (_m, _q, v) => sel(v, "/(tabs)/profile", "/pro/profile")],
  [/^referrals$/, (_m, _q, v) => sel(v, "/profile/referral", "/pro/referrals")],
  [/^gifts$/, () => "/profile/gifts"],
  [/^lawyers$/, () => "/(tabs)/lawyers"],
  [/^lawyers\/([^/]+)$/, (m) => `/lawyer/${enc(m[1])}`],
  [/^doc-analysis$/, () => "/doc-analysis"],
  [/^(ai|ai-help|assistant)$/, () => "/(tabs)/ai"],
  [/^services$/, (_m, _q, v) => sel(v, "/(tabs)/services", "/pro/services")],
  [/^services\/document\/([^/]+)(\/view)?$/, (m) => `/services/${enc(m[1])}`],
  [/^calendar$/, () => "/pro/calendar"],
  [/^tasks$/, () => "/pro/tasks"],
  [/^files$/, () => "/pro/files"],
  [/^clients$/, () => "/(tabs)/clients"],
  [/^promotion$/, () => "/pro/promotions"],
  [/^meetings$/, () => "/meetings"],
];
