import { crumb, track } from "@/shared/analytics";
import { resolveLink, resolveUrl, type Resolution, type Viewer } from "@/shared/links";
import { usePendingLink, type LinkRequest } from "./pending";
import { probeTarget } from "./probe";

export type OpenDeps = { navigate: (href: string) => void; say: (text: string, kind?: "ok" | "err" | "info") => void; t: (key: string) => string };
export type OpenResult = "opened" | "fallback" | "blocked" | "none" | "signin";

export const resolveRequest = (r: LinkRequest, v: Viewer): Resolution => ("url" in r ? resolveUrl(r.url, v) : resolveLink(r.input, v));

const done = (source: string, result: OpenResult, v: Viewer, kind = "none"): OpenResult => {
  track("deep_link_result", { source, result, kind, role: v.kind });
  crumb(`link:${result}`);
  return result;
};

/**
 * Opens a notification / push / link request for this viewer (TZ 28, 40): signed out → sign in
 * first and open it afterwards; not allowed → safe home + message; resource closed (404/403 or a
 * finished call) → the safe list + message; otherwise the target. Never throws.
 */
export async function openLink(req: LinkRequest, v: Viewer, d: OpenDeps, source: string): Promise<OpenResult> {
  if (!v.signedIn) {
    usePendingLink.getState().set(req);
    d.navigate("/auth/login");
    return done(source, "signin", v);
  }
  const r = resolveRequest(req, v);
  if (r.kind === "none") return done(source, "none", v);
  if (r.kind === "blocked") {
    d.say(d.t("nt4.blocked"), "info");
    d.navigate(r.fallback);
    return done(source, "blocked", v);
  }
  const { target } = r;
  const verdict = target.probe ? await probeTarget(target.probe) : "open";
  if (verdict === "closed") {
    d.say(d.t("nt4.closed"), "info");
    d.navigate(target.fallback);
    return done(source, "fallback", v, target.label);
  }
  d.navigate(target.href);
  return done(source, "opened", v, target.label);
}
