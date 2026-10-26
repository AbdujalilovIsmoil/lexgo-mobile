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

const first = (rules: Rule[], path: string, q: Q, v: Viewer): string | null => {
  for (const [re, build] of rules) {
    const m = re.exec(path);
    if (m) return build(m, q, v);
  }
  return null;
};

/** Website path (locale already stripped) → app href, or null when the app has no such screen (the admin panel has none). */
export function webToApp(path: string, q: Q, v: Viewer): string | null {
  const parts = path.split("/").filter(Boolean);
  if (parts[0] === "portal") {
    if (parts[1] === "chat" && parts[2]) return `/chat/${enc(parts[2])}`;
    return first(PORTAL, parts.slice(2).join("/"), q, v);
  }
  return first(PUBLIC, parts.join("/"), q, v);
}
