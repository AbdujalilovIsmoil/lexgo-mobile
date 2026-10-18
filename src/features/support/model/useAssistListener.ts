import { useUserEvents } from "@/shared/realtime";
import { errorHaptic, successHaptic, tapHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";
import { assistInfoOf, settleOf, supportEventOf } from "@/entities/support";
import { useAssistStore } from "./assistStore";

const EVENTS = ["support.", "notification.created", "subscription.", "payment.", "marketplace.", "document_request."];

// App-wide: an operator's action on my behalf opens the preview sheet; the backend's payment / order
// events then settle it. Nothing here ever marks a payment as paid on its own (TZ 27, 45).
export function useAssistListener() {
  const { t, locale } = useT();
  useUserEvents(EVENTS, (raw) => {
    const e = supportEventOf(raw);
    const card = e?.kind === "assist" ? assistInfoOf(e, locale) : null;
    if (card) {
      useAssistStore.getState().show(card);
      tapHaptic();
      return;
    }
    const s = settleOf(raw);
    const done = s ? useAssistStore.getState().settle(s.kind, s.pay, s.ids) : null;
    if (!done) return;
    if (done.pay === "approved") successHaptic();
    else errorHaptic();
    toast(t(done.pay === "approved" ? "sp6.settled.approved" : "sp6.settled.rejected"), done.pay === "approved" ? "ok" : "err");
  });
}
