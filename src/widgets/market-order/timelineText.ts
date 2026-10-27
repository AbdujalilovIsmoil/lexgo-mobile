import type { FlowEvent } from "@/entities/market-flow";

type T = (key: string, params?: Record<string, string | number>) => string;
const known = (t: T, key: string) => t(key) !== key;

// One event of the order's unified timeline in words, for the client's and the seller's history: a status step, the call center's
// offer and the client's choice, a cancellation review and its outcome, a reassignment ("Specialist changed by the call center. Reason:
// …") or a refund. `statusWord` names a status in the caller's own vocabulary.
export function eventText(e: FlowEvent, t: T, statusWord: (s: string) => string): { title: string; note: string } {
  const by = e.actor ? t("mf.tl.by", { actor: e.actor }) : "";
  const with_ = (note: string) => [note, by].filter(Boolean).join(" · ");
  switch (e.type) {
    case "reassignment":
      return { title: t("mf.tl.reassignment"), note: with_(e.note ? t("mf.tl.reason", { reason: e.note }) : "") };
    case "refund":
      return { title: t("mf.tl.refund", { status: known(t, `mf.rf.status.${e.status}`) ? t(`mf.rf.status.${e.status}`) : statusWord(e.status) }), note: with_("") };
    case "assignment_resolution": {
      const k = e.choice === "reassign" || e.choice === "refund" ? `mf.tl.resolution.chose.${e.choice}` : e.status === "expired" ? "mf.tl.resolution.expired" : "mf.tl.resolution.offered";
      return { title: t(k), note: with_(e.note) };
    }
    case "cancellation_review": {
      const action = e.choice && known(t, `mf.tl.cancelAction.${e.choice}`) ? t(`mf.tl.cancelAction.${e.choice}`) : "";
      return { title: action ? `${t("mf.tl.cancelResolved")}: ${action}` : t(e.status === "resolved" ? "mf.tl.cancelResolved" : "mf.tl.cancelOpened"), note: with_(e.note) };
    }
    default:
      return { title: statusWord(e.status), note: with_(e.note) };
  }
}

// A step that ended the order badly (shown in red).
export const eventFailed = (e: FlowEvent): boolean => /^(cancelled|canceled|declined|rejected|lost|failed|expired)$/.test(e.status) && e.type !== "assignment_resolution";
