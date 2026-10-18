import { CASE_STATUSES, caseTint, useCases } from "@/entities/pro-cases";
import { useT } from "@/shared/i18n";
import { tOr } from "@/shared/lib/pro/tOr";
import { BarList, SectionCard } from "@/shared/ui/admin";

// Own cases by status as a bar list (counted from the case list; hidden while there are none).
export function CaseMix() {
  const { t } = useT();
  const cases = useCases().data ?? [];
  const items = CASE_STATUSES.map((s) => ({ label: tOr(t, `aw11.caseStatus.${s}`, s), value: cases.filter((c) => c.status === s).length, color: caseTint(s) })).filter((x) => x.value > 0);
  if (!items.length) return null;
  return <SectionCard title={t("aw9.cases")}><BarList items={items} /></SectionCard>;
}
