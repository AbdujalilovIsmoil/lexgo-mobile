import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { AREA_KEYS, REGION_KEYS, useMarketMeta, type LawyerFilters, type LawyerSort } from "@/entities/lawyer";
import { FilterChips, FilterSeg, FilterSelect, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtCompact } from "@/shared/lib/money";

type Props = { draft: LawyerFilters; set: (p: Partial<LawyerFilters>) => void };
const SORTS: LawyerSort[] = ["recommended", "rating", "experience", "price_asc"];

const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={s.group}><Text variant="small" tone="gray" weight="semibold" style={s.label}>{title}</Text>{children}</View>
);

// The filter sheet (Adliya): the type and the rating as segmented switches, the area, experience and price as chips, and the long lists
// (region, category, service, sort) as select fields that open their options one at a time.
export function FilterOptions({ draft, set }: Props) {
  const { t } = useT();
  const { data } = useMarketMeta();
  const [open, setOpen] = useState("");
  const toggle = (k: string) => setOpen((o) => (o === k ? "" : k));
  const any = { value: "", label: t("flt.any") };
  const kinds = [{ value: "all", label: t("flt.kindOptions.all") }, { value: "advokat", label: t("flt.kindOptions.advokat") }, { value: "yurist", label: t("flt.kindOptions.yurist") }] as const;
  const ratings = [{ value: 0, label: t("flt.any") }, { value: 4, label: "4.0+" }, { value: 4.5, label: "4.5+" }];
  const exp = [0, 3, 5, 10].map((n) => ({ value: n, label: n ? t("flt.expN", { n }) : t("flt.any") }));
  const prices = [0, 200000, 300000, 500000].map((v) => ({ value: v, label: v ? t("flt.priceUpTo", { n: fmtCompact(v) }) : t("flt.any") }));
  const areas = AREA_KEYS.map((k) => ({ value: k as string, label: t(`services.areas.${k}`) }));
  const cats = [any, ...(data?.categories ?? []).map((c) => ({ value: c.id, label: c.title }))];
  const services = [any, ...(data?.services ?? []).filter((x) => !draft.category || x.categoryId === draft.category).map((x) => ({ value: x.id, label: x.title }))];
  return (
    <View style={s.col}>
      <Group title={t("flt.kind")}><FilterSeg options={[...kinds]} value={draft.kind} onChange={(kind) => set({ kind })} /></Group>
      <Group title={t("flt.area")}><FilterChips options={areas} value={draft.area} onChange={(area) => set({ area })} clearable empty="" /></Group>
      <Group title={t("flt.region")}>
        <FilterSelect label={t("flt.region")} options={[{ value: "", label: t("flt.allRegions") }, ...REGION_KEYS.map((k) => ({ value: k as string, label: t(`lawyers.regions.${k}`) }))]} value={draft.region} onChange={(region) => set({ region })} open={open === "region"} onToggle={() => toggle("region")} />
      </Group>
      <Group title={t("flt.rating")}><FilterSeg options={ratings} value={draft.minRating} onChange={(minRating) => set({ minRating })} /></Group>
      <Group title={t("flt.experience")}><FilterChips options={exp} value={draft.minExp} onChange={(minExp) => set({ minExp })} /></Group>
      <Group title={t("flt.price")}><FilterChips options={prices} value={draft.maxPrice} onChange={(maxPrice) => set({ maxPrice })} /></Group>
      {cats.length > 1 ? (
        <Group title={t("flt.category")}>
          <FilterSelect label={t("flt.category")} options={cats} value={draft.category} onChange={(category) => set({ category, service: "" })} open={open === "cat"} onToggle={() => toggle("cat")} />
        </Group>
      ) : null}
      {services.length > 1 ? (
        <Group title={t("flt.service")}>
          <FilterSelect label={t("flt.service")} options={services} value={draft.service} onChange={(service) => set({ service })} open={open === "svc"} onToggle={() => toggle("svc")} />
        </Group>
      ) : null}
      <Group title={t("flt.sort")}>
        <FilterSelect label={t("flt.sort")} options={SORTS.map((k) => ({ value: k as string, label: t(`flt.sortOptions.${k}`) }))} value={draft.sort} onChange={(sort) => set({ sort: sort as LawyerSort })} open={open === "sort"} onToggle={() => toggle("sort")} />
      </Group>
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 18 }, group: { gap: 10 }, label: { fontSize: 14.5 } });
