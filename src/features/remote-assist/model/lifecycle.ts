import { endRa, pauseRa, RA_ERR, raErrorCode, resumeRa, revokeRa } from "@/entities/remote-assist";
import { translate } from "@/shared/i18n/useT";
import { useLocaleStore } from "@/shared/i18n/localeStore";
import { toast } from "@/shared/ui/toastStore";
import { raRuntime } from "./runtime";
import { useRaStore } from "./store";

export type RaControlKind = "pause" | "resume" | "revoke" | "end";

// Reasons for the audit trail (§13), in the backend's language.
const REASON = { pause: "Client requested a pause", revoke: "Client stopped access", end: "Client ended the session" };

/** The client's own controls of the banner (§13): only the client pauses or resumes; revoke and end close the session at once. */
export async function raControl(kind: RaControlKind): Promise<void> {
  const rt = raRuntime();
  const s = useRaStore.getState().session;
  if (!rt || !s || useRaStore.getState().busy) return;
  useRaStore.setState({ busy: kind });
  try {
    if (kind === "pause" || kind === "resume") {
      const next = kind === "pause" ? await pauseRa(s.id, REASON.pause) : await resumeRa(s.id);
      if (next.id) rt.merge(next);
      else rt.refresh();
    } else {
      await (kind === "revoke" ? revokeRa(s.id, REASON.revoke) : endRa(s.id, REASON.end));
      rt.end(kind === "revoke" ? "revoked" : "ended");
    }
  } catch (e) {
    const code = raErrorCode(e);
    if (code === RA_ERR.sessionExpired) rt.end("expired");
    else if (code === RA_ERR.deviceMismatch) rt.end("revoked");
    else {
      toast(translate(useLocaleStore.getState().locale, "ra.failed"), "err");
      rt.refresh();
    }
  } finally {
    useRaStore.setState({ busy: "" });
  }
}

/** A deliberate sign-out first takes the operator's access away, while the token still authorises it (§2: no session outlives the client). */
export async function revokeForSignOut(): Promise<void> {
  const rt = raRuntime();
  if (!rt) return;
  await revokeRa(rt.id, "Client signed out").catch(() => undefined);
  rt.stop();
}
