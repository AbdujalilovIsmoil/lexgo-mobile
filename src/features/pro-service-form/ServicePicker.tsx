import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useCatalogBrowse, useServiceCategories, useServiceSearch } from "@/entities/service";
import { isAdvocateOnly } from "@/entities/pro-service";
import { useColors } from "@/shared/theme";
import { Icon, Input, ListRowSkeleton, PressableScale, Text } from "@/shared/ui";
import { ChipBar } from "@/shared/ui/admin";
import { useDebounced } from "@/shared/lib/useDebounced";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import type { PickedService } from "./types";

type Props = { onPick: (s: PickedService) => void; taken: Set<string>; yurist: boolean };

// Pick a service from the catalogue: it is listed right away (with category chips when the catalogue has categories) and
// narrowed by search (GET /services/search) from 2 characters. Already added ones and — for a yurist — advocate-only ones
// are shown but cannot be chosen.
export function ServicePicker({ onPick, taken, yurist }: Props) {
  const { t } = useT();
  const c = useColors();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const term = useDebounced(q, 300);
  const searching = q.trim().length >= 2;
  const found = useServiceSearch(term);
  const browse = useCatalogBrowse(cat);
  const cats = useServiceCategories().data ?? [];
  const res = searching ? found : browse;
  const rows = (res.data ?? []).filter((x) => x.isActive);
  return (
    <View style={s.col}>
      <Input accessibilityLabel={t("proSvc.form.service")} value={q} onChangeText={setQ} placeholder={t("proSvc.form.searchPh")} autoCapitalize="none" autoCorrect={false} left={<Icon name="search" size={18} tone="gray" />} right={q ? <PressableScale onPress={() => setQ("")} hitSlop={12} accessibilityLabel={t("proSvc.form.clear")}><Icon name="x-circle" size={18} tone="gray" /></PressableScale> : undefined} hint={t("proSvc.form.serviceHint")} />
      {!searching && cats.length ? (
        <View style={s.chips}>
          <ChipBar value={cat} onChange={setCat} options={[{ value: "", label: t("proSvc.form.allCategories") }, ...cats.map((x) => ({ value: x.id, label: x.name }))]} />
        </View>
      ) : null}
      {!searching && rows.length ? <Text variant="small" weight="bold" tone="gray">{t("proSvc.form.catalog")}</Text> : null}
      {res.isFetching && !rows.length ? <ListRowSkeleton rows={3} /> : null}
      {!searching && !res.isFetching && !res.isError && !rows.length ? <Text variant="small" tone="gray">{t("proSvc.form.catalogEmpty")}</Text> : null}
      {res.isError ? <Text variant="small" style={{ color: c.err }} accessibilityRole="alert">{t("proSvc.form.searchFailed")}</Text> : null}
      {q.trim().length >= 2 && !res.isFetching && !res.isError && !rows.length ? <Text variant="small" tone="gray">{t("proSvc.form.noResults")}</Text> : null}
      {rows.slice(0, 40).map((x) => {
        const block = taken.has(x.id) ? "added" : yurist && isAdvocateOnly(x, x.slug) ? "advocateOnly" : "";
        return (
          <PressableScale key={x.id} disabled={!!block} accessibilityLabel={`${x.name}${block ? `, ${t(`proSvc.form.${block}`)}` : ""}`} accessibilityHint={block === "advocateOnly" ? t("proSvc.form.advocateOnlyHint") : undefined} onPress={() => onPick({ id: x.id, name: x.name, category: [x.categoryTitle, x.subcategory].filter(Boolean).join(" · "), catalogPrice: x.price ?? 0, advokatRequired: x.advokatRequired, slug: x.slug })} style={[s.row, { borderColor: c.line, opacity: block ? 0.5 : 1 }]}>
            <View style={s.col}>
              <Text variant="body" weight="semibold" numberOfLines={2}>{x.name}</Text>
              <Text variant="caption" tone="gray" numberOfLines={1}>{block ? t(`proSvc.form.${block}`) : [x.categoryTitle, x.price ? t("proSvc.form.fromPrice", { price: fmtMoney(x.price) }) : t("proSvc.form.noPriceTag")].filter(Boolean).join(" · ")}</Text>
            </View>
            <Icon name={block ? "lock" : "plus-circle"} size={20} tone={block ? "gray" : "accent"} />
          </PressableScale>
        );
      })}
    </View>
  );
}

// The chip row runs edge to edge: it cancels the sheet gutter (18) and brings its own (16).
const s = StyleSheet.create({ col: { flex: 1, gap: 8 }, chips: { marginHorizontal: -18 }, row: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, minHeight: 56, borderRadius: 14, borderWidth: 1.5 } });
