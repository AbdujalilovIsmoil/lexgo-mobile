import { answerRa, getRaSession, grantedScopes, mergeSession, RA_ERR, raErrorCode } from "@/entities/remote-assist";
import { translate } from "@/shared/i18n/useT";
import { useLocaleStore } from "@/shared/i18n/localeStore";
import { toast } from "@/shared/ui/toastStore";
import { deviceSessionId } from "./device";
import { closeRequest, refreshRequests } from "./discovery";
import { env } from "./env";
import { startRuntime } from "./runtime";
import { showEnded, useRaStore } from "./store";

/**
 * The client's answer to the request on screen (TZ RA §8): POST …/consent with the session's own mode, the scopes left switched on, this
 * app run's device session id and the consent version. Accept starts the session here; deny ends it for good.
 */
export async function answerRequest(decision: "accept" | "deny", off: ReadonlySet<string>): Promise<void> {
  const req = useRaStore.getState().request;
  if (!req || useRaStore.getState().busy) return;
  useRaStore.setState({ busy: decision, failed: false });
  const granted = grantedScopes(req.requestedScopes, off);
  const device = deviceSessionId();
  try {
    const consentVersion = env.meta()?.consentVersion || req.consentVersion || "1.0";
    const res = await answerRa(req.id, { decision, mode: req.mode, grantedScopes: granted, deviceSessionId: device, consentVersion });
    closeRequest(req.id);
    if (decision === "deny") return showEnded("denied");
    const live = res.id ? mergeSession(req, res) : { ...req, status: "active", phase: "active" as const, grantedScopes: granted };
    if (live.phase === "closed") return showEnded("expired");
    startRuntime(live.phase === "pending" ? { ...live, status: "active", phase: "active", grantedScopes: granted } : live, device);
  } catch (e) {
    if (raErrorCode(e) !== RA_ERR.consentNotPending) {
      useRaStore.setState({ failed: true });
      return;
    }
    // §19: the request is no longer waiting — read it again (a double tap may already have accepted it here)
    closeRequest(req.id);
    const now = await getRaSession(req.id).catch(() => null);
    if (decision === "accept" && now?.phase === "active") return startRuntime(mergeSession(req, now), device);
    toast(translate(useLocaleStore.getState().locale, "ra.gone"), "info");
    void refreshRequests();
  } finally {
    useRaStore.setState({ busy: "" });
  }
}

/** The countdown reached zero: the server decides — a request it still holds as pending stays answerable (the phone's clock may run ahead). */
export async function requestTimedOut(id: string): Promise<void> {
  const now = await getRaSession(id).catch(() => null);
  if (now?.phase === "pending") return;
  closeRequest(id);
  void refreshRequests();
}
