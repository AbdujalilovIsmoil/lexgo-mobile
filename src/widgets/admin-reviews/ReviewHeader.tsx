import { View } from "react-native";
import type { Review, ReviewFilter } from "@/entities/admin-reviews";
import { CcHero, CcTiles } from "@/shared/ui/cc";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { ReviewFilters } from "./ReviewFilters";

const ORDER = ["pending", "approved", "active", "rejected"];
type Props = { all: Review[]; value: ReviewFilter; onChange: (v: ReviewFilter) => void };

// Hero (count, average stars, awaiting moderation), status tiles with counts and the collapsed type / rating filters.
export function ReviewHeader({ all, value, onChange }: Props) {
  const { t } = useT();
  const c = useColors();
  const n = (s: string) => all.filter((r) => r.status === s).length;
  const rated = all.filter((r) => r.rating > 0);
  const avg = rated.length ? (rated.reduce((a, r) => a + r.rating, 0) / rated.length).toFixed(1) : "—";
  const tint: Record<string, string> = { pending: c.warn, approved: c.ok, active: c.ok, rejected: c.err };
  const statuses = ORDER.filter((s) => n(s) > 0 || value.status === s);
  const options = [{ value: "", label: t("adm.all"), count: all.length }, ...statuses.map((s) => ({ value: s, label: t(`admSt.${s}`), count: n(s), alert: s === "pending" }))];
  return (
    <View style={{ gap: 12, paddingBottom: 12 }}>
      <CcHero
        stats={[{ value: String(all.length), label: t("admRevV.reviews") }, { value: `${avg} ★`, label: t("admRevV.average") }, { value: String(n("pending")), label: t("admSt.pending"), color: n("pending") ? c.warn : undefined }]}
        segments={statuses.map((s) => ({ key: s, value: n(s), color: tint[s], label: `${t(`admSt.${s}`)} ${n(s)}` }))}
      />
      <View style={{ marginHorizontal: -16 }}><CcTiles options={options} value={value.status} onChange={(status) => onChange({ ...value, status })} /></View>
      <ReviewFilters value={value} onChange={onChange} />
    </View>
  );
}
