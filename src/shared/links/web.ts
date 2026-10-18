import { PORTAL, type Q, type Rule } from "./webPortal";
import { enc, type Viewer } from "./types";

const PUBLIC: Rule[] = [
  [/^$/, () => "/"],
  [/^lawyers$/, () => "/(tabs)/lawyers"],
  [/^lawyers\/([^/]+)$/, (m) => `/lawyer/${enc(m[1])}`],
  [/^services(\/.*)?$/, () => "/(tabs)/services"],
  [/^subscription$/, () => "/subscription"],
  [/^login$/, () => "/auth/login"],
  [/^register$/, () => "/auth/register"],
  [/^reset-password$/, () => "/auth/forgot"],
  [/^chat\/([^/]+)$/, (m) => `/chat/${enc(m[1])}`],
  [/^ai$/, () => "/(tabs)/ai"],
];

const ADMIN_ALIAS: Record<string, string> = { "call-center": "callcenter", "legal-aid": "legalAid", "register-requests": "registerRequests", "test-otps": "testOtps", "ai-reglaments": "aiReglaments", "call-analytics": "callAnalytics" };
const first = (rules: Rule[], path: string, q: Q, v: Viewer): string | null => {
  for (const [re, build] of rules) {
    const m = re.exec(path);
    if (m) return build(m, q, v);
  }
  return null;
};

/** Website path (locale already stripped) → app href, or null when the app has no such screen. */
export function webToApp(path: string, q: Q, v: Viewer): string | null {
  const parts = path.split("/").filter(Boolean);
  if (parts[0] === "portal") {
    if (parts[1] === "chat" && parts[2]) return `/chat/${enc(parts[2])}`;
    return first(PORTAL, parts.slice(2).join("/"), q, v);
  }
  if (parts[0] === "admin") {
    const key = parts[1] ? (ADMIN_ALIAS[parts[1]] ?? parts[1]) : "";
    return key && /^[A-Za-z]+$/.test(key) ? `/manage/${key}` : "/(tabs)/admin";
  }
  return first(PUBLIC, parts.join("/"), q, v);
}
