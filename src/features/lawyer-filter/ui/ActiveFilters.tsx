import { ScrollView, StyleSheet } from "react-native";
import { useMarketMeta } from "@/entities/lawyer";
import { Chip } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import { useLawyerFilterStore } from "../model/filterStore";

// Chips for the applied filters; tap one to remove it.
export function ActiveFilters() {
  const { t } = useT();
  const { filters: f, set, reset } = useLawyerFilterStore();
  const { data: meta } = useMarketMeta();
  const items = [
    f.kind !== "all" && { key: "kind", label: t(`flt.kindOptions.${f.kind}`), off: () => set({ kind: "all" }) },
    f.region && { key: "region", label: t(`lawyers.regions.${f.region}`), off: () => set({ region: "" }) },
    f.service && { key: "service", label: meta?.services.find((x) => x.id === f.service)?.title ?? t("flt.service"), off: () => set({ service: "" }) },
    f.category && !f.service && { key: "category", label: meta?.categories.find((x) => x.id === f.category)?.title ?? t("flt.category"), off: () => set({ category: "" }) },
    f.minExp > 0 && { key: "exp", label: t("flt.expN", { n: f.minExp }), off: () => set({ minExp: 0 }) },
    f.minRating > 0 && { key: "rating", label: `★ ${t("flt.ratingFrom", { n: f.minRating })}`, off: () => set({ minRating: 0 }) },
    f.maxPrice > 0 && { key: "price", label: t("flt.priceUpTo", { n: fmtMoney(f.maxPrice) }), off: () => set({ maxPrice: 0 }) },
  ].filter(Boolean) as { key: string; label: string; off: () => void }[];
  if (!items.length) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
      {items.map((i) => <Chip key={i.key} label={i.label} icon="x" active onPress={i.off} />)}
      <Chip label={t("flt.clear")} onPress={reset} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: { gap: 8, paddingHorizontal: 16 },
});
