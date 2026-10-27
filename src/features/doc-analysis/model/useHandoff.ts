import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { sendToAdvocate, useAdvocateQuote, useRequestState, type DocAnalysis, type HandoffResult, type PickedDoc } from "@/entities/doc-analysis";
import { useDocRefusal, useDocSettings } from "@/entities/doc-settings";
import { ApiError } from "@/shared/api";
import { toast } from "@/shared/ui";
import { useLocaleStore, useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";

// "Send this document to an advocate": only for an analysed FILE (a pasted text is not a document the review endpoint accepts). The page
// count is the one the server measured. It is the review mode of the document service: not offered when the platform switched it off,
// shown closed with the reason when the plan does not include it (TZ.md §4).
export function useHandoff(file: PickedDoc | null, result: DocAnalysis | null) {
  const { t } = useT();
  const locale = useLocaleStore((s) => s.locale);
  const gate = useDocSettings().gate("review");
  const refusal = useDocRefusal();
  const pages = result?.pageCount ?? 0;
  const [urgent, setUrgent] = useState(false);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState<HandoffResult | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const quote = useAdvocateQuote(gate.state === "open" ? pages : 0, urgent);
  const state = useRequestState(sent && !sent.alreadyExists ? sent.requestId : "");

  const send = useMutation({
    mutationFn: () => sendToAdvocate({ file: file as PickedDoc, need: note.trim() || t("docs.need"), pageCount: pages, language: locale === "ru" ? "ru" : "uz-latn", urgent }),
    onSuccess: (r) => {
      setSent(r);
      if (!r.paymentRequired && !r.alreadyExists) successHaptic();
    },
    onError: (e) => {
      errorHaptic();
      const refused = refusal(e);
      if (refused) toast(refused, "err");
      else if (e instanceof ApiError && e.status === 402) setPlan(e.detail ?? "");
      else toast(e instanceof ApiError && e.detail ? e.detail : t("docs.sendFailed"), "err");
    },
  });

  return { available: !!file && pages > 0 && gate.state !== "off", gate, urgent, setUrgent, note, setNote, quote, send, sent, state: state.data ?? null, plan, closePlan: () => setPlan(null) };
}
