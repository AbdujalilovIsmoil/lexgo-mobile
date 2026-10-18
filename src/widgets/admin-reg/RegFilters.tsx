import type { SellerStats } from "@/entities/admin-reg";
import { ChipBar, DateRangeBar, type DateRange } from "@/shared/ui/admin";
import { CcFilterBox } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";

type Props = { role: string; onRole: (v: string) => void; bar: DateRange; stats?: SellerStats };

// Role (with counts) and period behind one summary row ("Filters · Advokat · 30 days"); status lives in the tiles above.
export function RegFilters({ role, onRole, bar, stats }: Props) {
  const { t } = useT();
  const count: Record<string, number | undefined> = { advokat: stats?.advokat, yurist: stats?.yurist, advokat_tashkiloti: stats?.advokatTashkiloti };
  const roles = [{ value: "", label: t("adm.all") }, ...["advokat", "yurist", "advokat_tashkiloti"].map((v) => ({ value: v, label: t(`admReg.role.${v}`), count: count[v] }))];
  const on = [role && t(`admReg.role.${role}`), bar.preset !== "all" && (bar.preset === "custom" ? `${bar.from} – ${bar.to}` : t(`adm.${bar.preset}`))].filter(Boolean);
  return (
    <CcFilterBox active={on.length} summary={on.length ? `${t("adm.filters")} · ${on.join(" · ")}` : undefined}>
      <ChipBar options={roles} value={role} onChange={onRole} />
      <DateRangeBar bar={bar} withAll />
    </CcFilterBox>
  );
}
