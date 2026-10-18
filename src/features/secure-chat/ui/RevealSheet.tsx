import type { z } from "zod";
import { FormSheet } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import type { useRevealActions } from "../model/useRevealActions";
import { revealApproveSchema, revealAskSchema } from "./chatSchemas";

type Actions = ReturnType<typeof useRevealActions>;
export type RevealMode = "request" | "approve" | null;
type Schema = z.ZodType<{ text: string }, { text: string }>;

// Content reveal in two steps: a staff member asks (reason ≥ 5 characters), a second person approves.
export function RevealSheet({ mode, onClose, actions }: { mode: RevealMode; onClose: () => void; actions: Actions }) {
  const { t } = useT();
  const asking = mode === "request";
  // The rules depend on the step: a reason is required to ask, the approval only carries an id.
  const f = useAppForm((asking ? revealAskSchema : revealApproveSchema) as Schema, { text: "" });
  const busy = asking ? actions.request.isPending : actions.approve.isPending;
  const submit = f.handleSubmit(async (v) => {
    try {
      if (asking) await actions.request.mutateAsync(v.text);
      else await actions.approve.mutateAsync(v.text);
      f.reset({ text: "" });
      onClose();
    } catch { /* the mutation already toasted the server message */ }
  });
  return (
    <FormSheet visible={!!mode} onClose={onClose} title={asking ? t("admChat.revealAsk") : t("admChat.revealApprove")} subtitle={asking ? t("admChat.revealAskHint") : t("admChat.revealApproveHint")} onSubmit={() => void submit()} submitLabel={asking ? t("admChat.revealSend") : t("admChat.revealApprove")} submitting={busy} snaps={[0.5, 0.8]}>
      <FormInput control={f.control} name="text" label={asking ? t("admChat.revealReason") : t("admChat.revealRequestId")} placeholder={asking ? t("admChat.revealReasonPh") : actions.requestId ? t("admChat.revealIdKnown") : t("admChat.revealIdPh")} maxLength={asking ? 300 : 64} autoCapitalize="none" multiline={asking} />
      {asking ? <Text variant="caption" tone="gray">{t("admChat.revealAudit")}</Text> : null}
    </FormSheet>
  );
}
