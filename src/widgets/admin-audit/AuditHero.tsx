import { outcomeKind, type AuditEntry, type Chain } from "@/entities/admin-audit";
import { CcHero } from "@/shared/ui/cc";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// Log headline: records loaded, failed / denied actions, and how many hashes link up, with an outcome bar.
export function AuditHero({ rows, chain }: { rows: AuditEntry[]; chain: Chain }) {
  const { t } = useT();
  const c = useColors();
  const n = (k: string) => rows.filter((r) => outcomeKind(r) === k).length;
  const bad = n("bad");
  return (
    <CcHero
      stats={[{ value: String(rows.length), label: t("admAuditB.records") }, { value: String(bad), label: t("admAuditB.failed"), color: bad ? c.err : undefined }, { value: chain.total ? `${chain.linked}/${chain.total}` : "—", label: t("admAuditB.linked"), color: chain.total && chain.linked === chain.total ? c.ok : undefined }]}
      segments={[{ key: "ok", value: n("ok"), color: c.accent, label: t("admAuditB.okLabel") }, { key: "other", value: n("other"), color: c.warn, label: t("admAuditB.other") }, { key: "bad", value: bad, color: c.err, label: t("admAuditB.failed") }]}
    />
  );
}
