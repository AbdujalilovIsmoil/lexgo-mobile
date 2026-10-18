import { LINK_HOSTS, LINK_SCHEME } from "../config/infra";

export type Parsed = { path: string; query: Record<string, string>; web: boolean };

const LOCALE = /^\/(uz|ru|en)(?=\/|$)/;

function queryOf(qs: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of qs.split("&")) {
    const [k, v = ""] = pair.split("=");
    try {
      if (k) out[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, " "));
    } catch {
      /* malformed escape: skip the pair */
    }
  }
  return out;
}

// Link allowlist (TZ 40): `lexgo://…` and https on our own hosts only. http, javascript:, intent:,
// file:, data: and every other host are refused. The result is a clean path (no host, no locale,
// no `..`, no repeated slashes) plus the query; nothing here is ever passed on verbatim.
export function parseExternal(raw: string, hosts: readonly string[] = LINK_HOSTS): Parsed | null {
  const text = raw.trim();
  if (!text || text.length > 2048 || /[\u0000-\u001f\\]/.test(text)) return null;
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(text)?.[1].toLowerCase();
  let rest = text;
  let web = false;
  if (scheme === LINK_SCHEME) rest = text.slice(LINK_SCHEME.length + 1).replace(/^\/*/, "/");
  else if (scheme === "https") {
    const m = /^https:\/\/([^/?#:]+)(?::443)?([^#]*)/i.exec(text);
    if (!m || !hosts.includes(m[1].toLowerCase())) return null;
    rest = m[2] || "/";
    web = true;
  } else if (scheme) return null;
  else if (!text.startsWith("/")) return null;
  const [pathPart, qs = ""] = rest.split("#")[0].split(/\?(.*)/s);
  let path: string;
  try {
    path = decodeURIComponent(pathPart);
  } catch {
    return null;
  }
  path = "/" + path.split("/").filter(Boolean).join("/");
  if (web) path = path.replace(LOCALE, "") || "/";
  return path.split("/").includes("..") ? null : { path, query: queryOf(qs), web };
}
