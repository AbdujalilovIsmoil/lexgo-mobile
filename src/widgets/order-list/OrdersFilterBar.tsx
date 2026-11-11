import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Search, SlidersHorizontal, X } from "lucide-react-native";
import { selectHaptic } from "@/shared/lib/haptics";
import { brand, radius, shadows, useTheme } from "@/shared/theme";
import { Chip, PressableScale, singleLineText, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { STAGE_ICON } from "./OrderListCard";
import { OrdersFilterSheet } from "./OrdersFilterSheet";
import { STAGE_TABS, type useMyOrders } from "./useMyOrders";

// The stages as a rail of white pills with their counts (the chosen one dark), then the search and the filter button; sort lives in the
// sheet and, when not the default, shows underneath as a removable chip (the button carries a dot).
export function OrdersFilterBar({ m }: { m: ReturnType<typeof useMyOrders> }) {
  const { t } = useT();
  const { colors: c, dark, glass } = useTheme();
  const [open, setOpen] = useState(false);
  const sorted = m.sort !== "new";
  const stageColor = { all: c.ink, pending: c.warn, active: c.accent, completed: c.ok, cancelled: c.err };
  const white = dark ? c.surface : brand.white;
  // The chosen tab slides to the middle of the rail (kept inside the rail's range), so a half-hidden one at the edge comes fully into view.
  const rail = useRef<ScrollView>(null);
  const boxes = useRef(new Map<string, { x: number; width: number }>());
  const size = useRef({ view: 0, content: 0 });
  useEffect(() => {
    const box = boxes.current.get(m.stage);
    if (!box) return;
    const { view, content } = size.current;
    rail.current?.scrollTo({ x: Math.max(0, Math.min(box.x - (view - box.width) / 2, content - view)), animated: true });
  }, [m.stage]);
  return (
    <View style={s.wrap}>
      <ScrollView
        ref={rail}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={s.rail}
        contentContainerStyle={s.railRow}
        onLayout={(e) => { size.current.view = e.nativeEvent.layout.width; }}
        onContentSizeChange={(width) => { size.current.content = width; }}
      >
        {STAGE_TABS.map((k) => {
          const on = m.stage === k;
          const Glyph = k === "all" ? null : STAGE_ICON[k];
          const fg = on ? (dark ? c.ink : brand.white) : c.ink;
          return (
            <PressableScale
              key={k}
              haptic={false}
              scale={0.96}
              onPress={() => { selectHaptic(); m.setStage(k); }}
              onLayout={(e) => { boxes.current.set(k, { x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width }); }}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${t(`mk4.tabs.${k}`)}, ${m.counts[k]}`}
              style={[s.tab, !glass && shadows.s1, { backgroundColor: on ? (dark ? c.tint2 : c.ink) : white }]}
            >
              {Glyph ? <Glyph size={14} color={on ? fg : stageColor[k]} strokeWidth={2.2} /> : null}
              <Text variant="caption" weight={on ? "bold" : "semibold"} numberOfLines={1} style={[s.tabText, { color: fg }]}>{t(`mk4.tabs.${k}`)}</Text>
              <View style={[s.count, { backgroundColor: on ? "rgba(255,255,255,0.18)" : c.surface2 }]}>
                <Text variant="caption" weight="bold" style={[s.countText, { color: on ? fg : c.gray }]}>{m.counts[k]}</Text>
              </View>
            </PressableScale>
          );
        })}
      </ScrollView>
      <View style={s.search}>
        <View style={[s.field, !glass && shadows.s1, { backgroundColor: white }]}>
          <Search size={17} color={c.ink} />
          <TextInput
            value={m.q}
            onChangeText={m.setQ}
            placeholder={t("mk4.searchPh")}
            placeholderTextColor={c.gray2}
            accessibilityLabel={t("mk4.searchPh")}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            selectionColor={c.accent}
            style={[s.input, singleLineText, { color: c.ink }]}
          />
          {m.q ? (
            <PressableScale onPress={() => m.setQ("")} hitSlop={10} accessibilityRole="button" accessibilityLabel={t("tabs.svb.clear")}><X size={16} color={c.gray} /></PressableScale>
          ) : null}
        </View>
        <PressableScale onPress={() => setOpen(true)} scale={0.94} accessibilityRole="button" accessibilityLabel={t("dm11.filters")} style={[s.filter, !glass && shadows.s1, { backgroundColor: white }]}>
          <SlidersHorizontal size={18} color={c.ink} />
          {sorted || m.stage !== "all" ? <View style={[s.mark, { backgroundColor: c.accent, borderColor: white }]} /> : null}
        </PressableScale>
      </View>
      {sorted ? (
        <View style={s.chips}>
          <Chip label={t(`ods.${m.sort}`)} active icon="x" onPress={() => m.setSort("new")} />
        </View>
      ) : null}
      <OrdersFilterSheet visible={open} onClose={() => setOpen(false)} m={m} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 12, marginBottom: 14 },
  rail: { marginHorizontal: -16 },
  railRow: { gap: 8, paddingHorizontal: 16, paddingVertical: 2 },
  tab: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 36, paddingLeft: 12, paddingRight: 6, borderRadius: radius.pill },
  tabText: { fontSize: 12, lineHeight: 16 },
  count: { minWidth: 20, height: 20, paddingHorizontal: 6, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  countText: { fontSize: 11, lineHeight: 14 },
  search: { flexDirection: "row", alignItems: "center", gap: 8 },
  field: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44, paddingHorizontal: 14, borderRadius: radius.r },
  input: { flex: 1, minWidth: 0, fontSize: 14, paddingVertical: 8 },
  filter: { width: 44, height: 44, borderRadius: radius.r, alignItems: "center", justifyContent: "center" },
  mark: { position: "absolute", top: 8, right: 8, width: 9, height: 9, borderRadius: 5, borderWidth: 2 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
