import { ApproveButtons } from "@/features/admin-approvals";
import { statusText, typeLabel, type Approval } from "@/entities/admin-approvals";
import { FactRows, FormSheet, type Fact } from "@/shared/ui/admin";
import { fmtDateTime, humanizeSlug } from "@/shared/lib/format";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";

const HIDDEN = new Set(["work_id"]);

// The request behind an approval: status, who signed off, and the data it carries (name, phone, ids …).
export function ApprovalSheet({ item, onClose }: { item: Approval | null; onClose: () => void }) {
  const { t, locale } = useT();
  const a = useKept(item);
  const tick = (v: boolean) => (v ? "✓" : "—");
  const data: Fact[] = Object.entries(a?.payload ?? {})
    .filter(([k, v]) => !HIDDEN.has(k) && (typeof v === "string" || typeof v === "number" || typeof v === "boolean"))
    .map(([k, v]) => ({ label: humanizeSlug(k), value: String(v) }));
  return (
    <FormSheet visible={!!item} onClose={onClose} title={a ? typeLabel(t, a.type) : ""} subtitle={a?.workId}>
      {a ? (
        <>
          <FactRows rows={[
            { label: t("adm.status"), value: statusText(t, a.status) },
            { label: t("admAppr.admin"), value: tick(a.adminApproved) },
            { label: t("admAppr.manager"), value: tick(a.managerApproved) },
            { label: t("adm.reason"), value: a.reason },
            { label: t("adm.created"), value: fmtDateTime(a.createdAt, locale) },
          ]} />
          <FactRows rows={data} />
          <ApproveButtons item={a} />
        </>
      ) : null}
    </FormSheet>
  );
}
