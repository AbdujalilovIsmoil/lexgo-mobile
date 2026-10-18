import { enc } from "./types";

// The routes a `lexgo://…` link may name — the contract table of TZ_GUIDE.md section 3. Anything
// else is refused, so a crafted link can never reach an unplanned screen.
const TABS = "index|services|works|messages|workspace|requests|clients|leads|csupport|cclients|cmeetings|lawyers|orders|admin|notifs|profile|ai";
const ID = "[^/]+";
const ALLOWED: RegExp[] = [
  new RegExp(`^/(${TABS})$`),
  /^\/(notifications|assistant|chats|instructor|subscription|payments|entitlements|doc-analysis|sos|intake|matches|cases|packages|academy|complaints|ratings|warranty|security|marketplace|documents|orders|urgent|urgent\/requests|meetings|support|org)$/,
  new RegExp(`^/(payments|rate|works|dashboard-lists|chat|call|meetings|support|documents|orders|urgent|lawyer|org/members)/${ID}$`),
  new RegExp(`^/services/${ID}(/(fill|ai|lawyer))?$`), // also /services/direction (a direction's own page)
  /^\/(support|urgent)\/new$/,
  /^\/profile\/(family|methods|consents|referral|gifts)$/,
  /^\/settings\/(notifications|storage|security-lock)$/,
  new RegExp(`^/pro/(docs(/pool)?|cases|calendar|tasks|files|scan|templates|market|stats|referrals|onboarding|profile|services|packages|availability|orders|promotions|promotions/new|urgent)(/${ID})?$`),
  new RegExp(`^/pro/docs/${ID}/editor$`),
  new RegExp(`^/(cc/(clients|assist|urgent)|org/workload|pro/urgent)(/${ID})?$`),
  /^\/cc\/(complaints|calls|notify|urgent)$/,
  /^\/org\/(members|workload)$/,
  /^\/manage\/[A-Za-z0-9/_-]+$/,
  /^\/auth\/(login|register|forgot)$/,
];

const QUERY_KEEP = ["callId", "id", "tab"];

/** A clean in-app href for a `lexgo://` path, or null when the path is not an app route. */
export function appHref(path: string, query: Record<string, string> = {}): string | null {
  if (path === "/") return "/";
  if (!ALLOWED.some((re) => re.test(path))) return null;
  const tab = new RegExp(`^/(${TABS})$`).exec(path)?.[1];
  const base = tab ? (tab === "index" ? "/" : `/(tabs)/${tab}`) : path;
  const keep = QUERY_KEEP.filter((k) => query[k]).map((k) => `${k}=${enc(query[k])}`);
  return keep.length ? `${base}?${keep.join("&")}` : base;
}
