import { approvalStats, TINT, type Approval } from "@/entities/admin-approvals";
import { CcHero } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";

// Headline of the queue: how many wait for the admin and for the manager, and the split by sign-off progress.
export function ApprovalsHero({ list }: { list: Approval[] }) {
  const { t } = useT();
  const s = approvalStats(list);
  return (
    <CcHero
      stats={[
        { value: String(s.total), label: t("admApprB.total") },
        { value: String(s.waitAdmin), label: t("admApprB.waitAdmin"), color: s.waitAdmin ? TINT.warn : undefined },
        { value: String(s.waitManager), label: t("admApprB.waitManager"), color: s.waitManager ? TINT.warn : undefined },
      ]}
      segments={[
        { key: "signed", value: s.signed, color: TINT.ok, label: `${t("admApprB.signed")} ${s.signed}` },
        { key: "one", value: s.one, color: TINT.blue, label: `${t("admApprB.oneSigned")} ${s.one}` },
        { key: "none", value: s.none, color: TINT.warn, label: `${t("admApprB.noneSigned")} ${s.none}` },
        { key: "shut", value: s.shut, color: TINT.err, label: `${t("admApprB.shut")} ${s.shut}` },
      ]}
    />
  );
}
