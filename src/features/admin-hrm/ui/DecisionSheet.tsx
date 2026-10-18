import { type Approval, HrmStatus, useNames } from "@/entities/admin-hrm";
import { FactRows, FormSheet } from "@/shared/ui/admin";
import { confirmDialog } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { fmtDateTime, humanizeSlug } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { useKept } from "@/shared/lib/useKept";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { commentSchema } from "../model/workSchemas";
import { useDecide } from "../model/useWorkActions";

// Review one approval: its facts and payload, a comment, and Approve / Reject (only while it is pending).
export function DecisionSheet({ item: current, onClose }: { item: Approval | null; onClose: () => void }) {
  const { t, locale } = useT();
  const item = useKept(current);
  const names = useNames();
  const f = useAppForm(commentSchema, { comment: "" });
  useSheetReset(!!current, () => f.reset({ comment: "" }));
  const decide = useDecide();
  const pending = item?.status === "pending";
  const go = (decision: "approved" | "rejected") =>
    f.handleSubmit(({ comment }) => {
      if (!item) return;
      confirmDialog({
        title: t(`admHrm.${decision}Title`), message: item.title, confirmLabel: t(`admHrm.${decision === "approved" ? "approve" : "reject"}`), cancelLabel: t("adm.cancel"), icon: decision === "approved" ? "check-circle" : "x-circle", danger: decision === "rejected",
        onConfirm: async () => { await decide.mutateAsync({ id: item.id, decision, comment }); f.reset({ comment: "" }); onClose(); },
      });
    })();
  const payload = Object.entries(item?.payload ?? {}).filter(([k, v]) => k !== "marker" && (typeof v === "string" || typeof v === "number")).map(([k, v]) => ({ label: humanizeSlug(k), value: k.includes("amount") && typeof v === "number" ? `${fmtMoney(v)} ${t("adm.currency")}` : String(v) }));
  return (
    <FormSheet
      visible={!!current} onClose={onClose} title={item?.title ?? ""} subtitle={item ? humanizeSlug(item.type) : undefined}
      onSubmit={pending ? () => void go("approved") : undefined} submitLabel={t("admHrm.approve")} submitting={decide.isPending}
      secondary={pending ? { label: t("admHrm.reject"), onPress: () => void go("rejected") } : undefined}
    >
      {item ? (
        <>
          <FactRows rows={[
            { label: t("adm.status"), value: <HrmStatus status={item.status} /> }, { label: t("admHrm.requester"), value: names.user(item.requesterId) },
            { label: t("adm.created"), value: fmtDateTime(item.createdAt, locale) }, { label: t("admHrm.decidedAt"), value: fmtDateTime(item.decidedAt, locale) },
            { label: t("admHrm.decisionNote"), value: item.comment }, ...payload,
          ]} />
          {pending ? <FormInput control={f.control} name="comment" label={t("adm.note")} multiline maxLength={2000} placeholder={t("admHrm.commentPh")} /> : null}
        </>
      ) : null}
    </FormSheet>
  );
}
