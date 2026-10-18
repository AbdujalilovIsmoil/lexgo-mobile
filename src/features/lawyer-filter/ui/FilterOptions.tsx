import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { AREA_KEYS, REGION_KEYS, useMarketMeta, type LawyerFilters, type LawyerSort } from "@/entities/lawyer";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtCompact } from "@/shared/lib/money";
import { FilterPicker } from "./FilterPicker";
import { FilterSteps } from "./FilterSteps";
import { FilterTiles } from "./FilterTiles";

type Props = { draft: LawyerFilters; set: (p: Partial<LawyerFilters>) => void };
const SORTS: LawyerSort[] = ["recommended", "rating", "experience", "price_asc"];

const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={s.group}><Text variant="small" tone="gray" weight="bold">{title}</Text>{children}</View>
);

// The filter sheet as a panel of cards: who (type), how good (rating tiles), how experienced / how much (stepped
// tracks), and the long lists (region, area, category, service, sort) as fields that open one at a time.
export function FilterOptions({ draft, set }: Props) {
  const { t } = useT();
  const { data } = useMarketMeta();
  const [open, setOpen] = useState("");
  const toggle = (k: string) => setOpen((o) => (o === k ? "" : k));
  const any = { value: "", label: t("flt.any") };
  const kinds = [{ value: "all", label: t("flt.kindOptions.all"), icon: "users" }, { value: "advokat", label: t("flt.kindOptions.advokat"), icon: "briefcase" }, { value: "yurist", label: t("flt.kindOptions.yurist"), icon: "user" }] as const;
  const ratings = [{ value: 0, label: t("flt.any"), icon: "layers" }, { value: 4, label: "4.0+", icon: "star" }, { value: 4.5, label: "4.5+", icon: "award" }] as const;
  const exp = [0, 3, 5, 10].map((n) => ({ value: n, label: n ? t("flt.expN", { n }) : t("flt.any") }));
  const prices = [0, 200000, 300000, 500000].map((v) => ({ value: v, label: v ? t("flt.priceUpTo", { n: fmtCompact(v) }) : t("flt.any") }));
  const cats = [any, ...(data?.categories ?? []).map((c) => ({ value: c.id, label: c.title }))];
  const services = [any, ...(data?.services ?? []).filter((x) => !draft.category || x.categoryId === draft.category).map((x) => ({ value: x.id, label: x.title }))];
  return (
    <View style={s.col}>
      <Group title={t("flt.kind")}><FilterTiles options={[...kinds]} value={draft.kind} onChange={(kind) => set({ kind })} /></Group>
      <Group title={t("flt.rating")}><FilterTiles options={[...ratings]} value={draft.minRating} onChange={(minRating) => set({ minRating })} /></Group>
      <Group title={t("flt.experience")}><FilterSteps options={exp} value={draft.minExp} onChange={(minExp) => set({ minExp })} /></Group>
      <Group title={t("flt.price")}><FilterSteps options={prices} value={draft.maxPrice} onChange={(maxPrice) => set({ maxPrice })} /></Group>
      <View style={s.list}>
        <FilterPicker icon="map-pin" title={t("flt.region")} options={[any, ...REGION_KEYS.map((k) => ({ value: k as string, label: t(`lawyers.regions.${k}`) }))]} value={draft.region} onChange={(region) => set({ region })} open={open === "region"} onToggle={() => toggle("region")} />
        <FilterPicker icon="book-open" title={t("flt.area")} options={[any, ...AREA_KEYS.map((k) => ({ value: k as string, label: t(`services.areas.${k}`) }))]} value={draft.area} onChange={(area) => set({ area })} open={open === "area"} onToggle={() => toggle("area")} />
        {cats.length > 1 ? <FilterPicker icon="layers" title={t("flt.category")} options={cats} value={draft.category} onChange={(category) => set({ category, service: "" })} open={open === "cat"} onToggle={() => toggle("cat")} /> : null}
        {services.length > 1 ? <FilterPicker icon="briefcase" title={t("flt.service")} options={services} value={draft.service} onChange={(service) => set({ service })} open={open === "svc"} onToggle={() => toggle("svc")} /> : null}
        <FilterPicker icon="sliders" title={t("flt.sort")} options={SORTS.map((k) => ({ value: k as string, label: t(`flt.sortOptions.${k}`) }))} value={draft.sort} onChange={(sort) => set({ sort: sort as LawyerSort })} open={open === "sort"} onToggle={() => toggle("sort")} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 20 }, group: { gap: 10 }, list: { gap: 10 } });
