import { useState } from "react";
import { useRouter } from "expo-router";
import { Text, toast, useErrorText } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { FormSheet } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { useSheetNavigate } from "@/shared/lib/useSheetNavigate";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { ModeNotice, useDocRefusal, useDocSettings } from "@/entities/doc-settings";
import { docKeys } from "@/entities/my-document";
import { DocTypePicker, existingOf, requestReview } from "@/entities/duty-request";
import { docReviewSchema } from "./docRatingSchemas";

type Props = { docId: string; visible: boolean; onClose: () => void };

// "Send to advocate review": a finished or filled document goes to the duty-advocate pool.
// The server decides: created / fee gate open (NOT with the advocates yet) / already open (409). The review mode of the document
// service closed for this account (TZ.md §4) is said up front, and nothing can be sent.
export function ReviewSheet({ docId, visible, onClose }: Props) {
  const { t } = useT();
  const router = useRouter();
  const errText = useErrorText();
  const refusal = useDocRefusal();
  const gate = useDocSettings().gate("review");
  const go = useSheetNavigate(onClose);
  const qc = useQueryClient();
  const f = useAppForm(docReviewSchema, { need: "" });
  const [type, setType] = useState("");
  useSheetReset(visible, () => { f.reset({ need: "" }); setType(""); });
  const done = () => { void qc.invalidateQueries({ queryKey: docKeys.all }); onClose(); };
  const m = useMutation({
    mutationFn: (need: string) => requestReview(docId, need || t("dm5.reviewDefault"), type || undefined),
    onSuccess: (r) => {
      if (r.created && !r.paymentRequired) successHaptic();
      toast(r.paymentRequired ? r.message || t("dm5.reviewGate") : !r.created ? r.message || t("dm9.existsText") : t("dm5.reviewSent"), r.created && !r.paymentRequired ? "ok" : "info");
      done();
    },
    onError: (e) => {
      errorHaptic();
      toast(existingOf(e) ? (e as ApiError).detail || t("dm9.existsText") : refusal(e) ?? errText(e), "err");
      if (existingOf(e)) done();
    },
  });
  const submit = f.handleSubmit((v) => m.mutate(v.need));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("dm5.reviewTitle")} subtitle={t("dm5.reviewSub")} onSubmit={() => void submit()} submitLabel={t("dm5.reviewSubmit")} submitting={m.isPending} disabled={gate.state !== "open"} snaps={[0.62, 0.92]}>
      {gate.state !== "open" ? <ModeNotice inline gate={gate} onPlan={() => go(() => router.push("/subscription"))} /> : (
        <>
          <DocTypePicker flow="constructor_review" value={type} onChange={setType} />
          <FormInput control={f.control} name="need" label={t("dm5.reviewNeed")} placeholder={t("dm5.reviewDefault")} multiline maxLength={2000} style={{ minHeight: 96, textAlignVertical: "top" }} />
          <Text variant="caption" tone="gray2">{t("dm5.reviewNote")}</Text>
        </>
      )}
    </FormSheet>
  );
}
