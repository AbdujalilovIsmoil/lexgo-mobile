import type { ReviewFilter } from "@/entities/admin-reviews";
import { ChipBar } from "@/shared/ui/admin";
import { CcFilterBox } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";

type Props = { value: ReviewFilter; onChange: (v: ReviewFilter) => void };

// Seller type and star rating behind one summary row ("Filters · Advokat · 5 ★"); the status lives in the tiles above.
export function ReviewFilters({ value, onChange }: Props) {
  const { t } = useT();
  const all = { value: "", label: t("adm.all") };
  const types = [all, ...["advokat", "yurist"].map((v) => ({ value: v, label: t(`admRev.type.${v}`) }))];
  const stars = [all, ...[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} ★` }))];
  const on = [value.sellerType && t(`admRev.type.${value.sellerType}`), value.rating ? `${value.rating} ★` : ""].filter(Boolean);
  return (
    <CcFilterBox active={on.length} summary={on.length ? `${t("adm.filters")} · ${on.join(" · ")}` : undefined}>
      <ChipBar options={types} value={value.sellerType} onChange={(sellerType) => onChange({ ...value, sellerType })} />
      <ChipBar options={stars} value={value.rating ? String(value.rating) : ""} onChange={(v) => onChange({ ...value, rating: Number(v) })} />
    </CcFilterBox>
  );
}
