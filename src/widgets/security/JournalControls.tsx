import { ScrollView, View } from "react-native";
import { activeFilterCount, filterChips, type FilterChip, type JournalFilter } from "@/entities/security";
import { useColors, radius } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { Icon, IconButton, Input, PressableScale, Text } from "@/shared/ui";

type Props = { filter: JournalFilter; search: string; total: number; onSearch: (v: string) => void; onOpenFilter: () => void; onRemove: (c: FilterChip) => void };

// Top of the list: search + «Filtr» button (dot when something is selected), the entry count, and the selected
// filters as removable chips.
export function JournalControls({ filter, search, total, onSearch, onOpenFilter, onRemove }: Props) {
  const { t } = useT();
  const c = useColors();
  const n = activeFilterCount(filter);
  const chips = filterChips(filter);
  const label = (ch: FilterChip) => (ch.type === "kind" ? t(`secUx.kind.${ch.kind}`) : t(ch.period === "today" ? "secUx.today" : ch.period === "7d" ? "secUx.p7" : "secUx.p30"));
  return (
    <View style={{ gap: 10, paddingBottom: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Input
            value={search}
            onChangeText={onSearch}
            placeholder={t("secUx.searchPh")}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            left={<Icon name="search" size={18} tone="gray" />}
            right={search ? <PressableScale onPress={() => onSearch("")} hitSlop={12} accessibilityLabel={t("secUx.clear")}><Icon name="x-circle" size={18} tone="gray" /></PressableScale> : undefined}
          />
        </View>
        <IconButton icon="sliders" badge={n > 0} onPress={onOpenFilter} label={n > 0 ? t("secUx.filterOn", { n }) : t("secUx.filter")} />
      </View>
      <Text variant="small" tone="gray">{t("secUx.total", { n: total })}</Text>
      {chips.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ flexGrow: 0 }}>
          {chips.map((ch) => (
            <PressableScale key={ch.id} onPress={() => onRemove(ch)} accessibilityRole="button" accessibilityLabel={t("secUx.removeChip", { label: label(ch) })} hitSlop={{ top: 6, bottom: 6 }} style={{ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 32, paddingLeft: 12, paddingRight: 10, borderRadius: radius.pill, backgroundColor: c.tint2 }}>
              <Text variant="small" weight="semibold" tone="accent">{label(ch)}</Text>
              <Icon name="x" size={14} color={c.accent} />
            </PressableScale>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}
