import { aidStats, TINT, type AidRequest } from "@/entities/admin-aid";
import { CcHero } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";

// Headline of the inbox: total, new today, still unhandled, and the split by stage.
export function AidHero({ list }: { list: AidRequest[] }) {
  const { t } = useT();
  const s = aidStats(list);
  return (
    <CcHero
      stats={[
        { value: String(s.total), label: t("admAidB.total") },
        { value: String(s.today), label: t("admAidB.today") },
        { value: String(s.fresh), label: t("admAidB.fresh"), color: s.fresh ? TINT.warn : undefined },
      ]}
      segments={[
        { key: "fresh", value: s.fresh, color: TINT.warn, label: `${t("admAid.new")} ${s.fresh}` },
        { key: "working", value: s.working, color: TINT.blue, label: `${t("admAidB.working")} ${s.working}` },
        { key: "done", value: s.done, color: TINT.ok, label: `${t("admAidB.done")} ${s.done}` },
        { key: "refused", value: s.refused, color: TINT.err, label: `${t("admAidB.refused")} ${s.refused}` },
      ]}
    />
  );
}
