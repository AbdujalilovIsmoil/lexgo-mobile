import { useState } from "react";
import { StyleSheet, View } from "react-native";
import type { ProService, ServiceFilter } from "@/entities/pro-service";
import { Icon, Input, PressableScale, Text } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { FilterSheet } from "./FilterSheet";

type Props = { items: ProService[]; filter: ServiceFilter; onFilter: (f: ServiceFilter) => void; search: string; onSearch: (s: string) => void };

// Search field + "Filtr" button (opens the status sheet) and the active filter as a removable chip.
export function ServicesToolbar({ items, filter, onFilter, search, onSearch }: Props) {
  const { t } = useT();
  const c = useColors();
  const [open, setOpen] = useState(false);
  const on = filter !== "all";
  return (
    <View style={s.col}>
      <View style={s.row}>
        <View style={s.grow}>
          <Input value={search} onChangeText={onSearch} placeholder={t("proSvc.search")} accessibilityLabel={t("proSvc.searchLabel")} autoCapitalize="none" autoCorrect={false} returnKeyType="search" left={<Icon name="search" size={18} tone="gray" />} right={search ? <PressableScale onPress={() => onSearch("")} hitSlop={12} accessibilityLabel={t("proSvc.formUi.close")}><Icon name="x-circle" size={18} tone="gray" /></PressableScale> : undefined} />
        </View>
        <PressableScale onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={t("proSvc.filter.button")} accessibilityHint={t("proSvc.filters.label")} style={[s.btn, { backgroundColor: on ? c.tint2 : c.surface, borderColor: on ? c.accent : c.line }]}>
          <Icon name="sliders" size={18} tone={on ? "accent" : "ink"} />
          <Text variant="small" weight="semibold" tone={on ? "accent" : "ink"}>{t("proSvc.filter.button")}</Text>
        </PressableScale>
      </View>
      {on ? (
        <View style={s.chips}>
          <PressableScale onPress={() => onFilter("all")} accessibilityLabel={t("proSvc.filter.remove")} accessibilityHint={t("proSvc.filter.chip", { name: t(`proSvc.filters.${filter}`) })} hitSlop={{ top: 6, bottom: 6 }} style={[s.chip, { backgroundColor: c.tint2, borderColor: c.accent }]}>
            <Text variant="small" weight="semibold" tone="accent">{t("proSvc.filter.chip", { name: t(`proSvc.filters.${filter}`) })}</Text>
            <Icon name="x" size={14} tone="accent" />
          </PressableScale>
        </View>
      ) : null}
      <FilterSheet visible={open} onClose={() => setOpen(false)} items={items} value={filter} onApply={onFilter} />
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  grow: { flex: 1 },
  btn: { flexDirection: "row", alignItems: "center", gap: 7, minHeight: 52, paddingHorizontal: 14, borderRadius: radius.r, borderWidth: 1.5 },
  chips: { flexDirection: "row" },
  chip: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 36, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1 },
});
