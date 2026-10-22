import { StyleSheet, View } from "react-native";
import { BottomSheet, Button, Icon, IconButton, PressableScale, SheetScroll, Text, type IconName } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { selectHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import type { InboxKind } from "./inbox";

type Opt = { value: InboxKind; label: string; count?: number };
const ICON: Record<InboxKind, IconName> = { all: "message-circle", unread: "bell", urgent: "zap", doc: "file-text", order: "shopping-bag", case: "briefcase", other: "layers" };
const TINT: Record<InboxKind, string> = { all: "#1668F0", unread: "#1668F0", urgent: "#EF4444", doc: "#8B5CF6", order: "#3B82F6", case: "#06B6D4", other: "#5C6E85" };

type Props = { visible: boolean; onClose: () => void; options: Opt[]; value: InboxKind; onChange: (k: InboxKind) => void; total: number };

// The inbox filter in a sheet: "All" and "Unread" as two big cards on top (what you reach for most), the conversation kinds
// as a list with their colour dot and count, and a pinned bar with "reset" and "show N".
export function InboxFilterSheet({ visible, onClose, options, value, onChange, total }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const top = options.filter((o) => o.value === "all" || o.value === "unread");
  const kinds = options.filter((o) => o.value !== "all" && o.value !== "unread");
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("dm11.filters")} snaps={[0.7, 0.92]}>
      <View style={s.fill}>
        <SheetScroll contentContainerStyle={s.scroll}>
          <View style={s.grid}>
            {top.map((o) => {
              const on = value === o.value;
              return (
                <PressableScale key={o.value} haptic={false} onPress={() => { selectHaptic(); onChange(o.value); }} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.card, { backgroundColor: on ? c.tint2 : c.surface2, borderColor: on ? c.accent : c.line }]}>
                  <View style={[s.tile, { backgroundColor: on ? c.accent : c.surface }]}><Icon name={ICON[o.value]} size={20} color={on ? "#FFFFFF" : c.accent} /></View>
                  <Text variant="h3">{o.count ?? 0}</Text>
                  <Text variant="small" weight="bold" numberOfLines={1}>{o.label}</Text>
                </PressableScale>
              );
            })}
          </View>
          {kinds.length ? (
            <View style={s.group}>
              <Text variant="small" tone="gray">{t("wks.kind")}</Text>
              <View style={s.list}>
                {kinds.map((o) => {
                  const on = value === o.value;
                  return (
                    <PressableScale key={o.value} haptic={false} onPress={() => { selectHaptic(); onChange(o.value); }} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.row, { backgroundColor: on ? c.tint2 : "transparent", borderColor: on ? c.accent : "transparent" }]}>
                      <View style={[s.dot, { backgroundColor: TINT[o.value] }]} />
                      <Text variant="body" weight={on ? "bold" : "regular"} numberOfLines={1} style={s.flex}>{o.label}</Text>
                      <Text variant="caption" tone="gray">{o.count ?? 0}</Text>
                      <View style={[s.radio, { borderColor: on ? c.accent : c.gray2, backgroundColor: on ? c.accent : "transparent" }]}>{on ? <Icon name="check" size={13} color="#FFFFFF" /> : null}</View>
                    </PressableScale>
                  );
                })}
              </View>
            </View>
          ) : null}
        </SheetScroll>
        <View style={[s.bar, { borderTopColor: c.line, paddingBottom: Math.max(insets.bottom - 18, 12) }]}>
          <IconButton icon="rotate-ccw" size={48} label={t("dm1.reset")} onPress={() => onChange("all")} />
          <Button title={`${t("dm11.fShow")} · ${total}`} variant="gradient" full style={s.flex} onPress={onClose} />
        </View>
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingBottom: 12 }, // the pinned bar below already clears the home indicator
  grid: { flexDirection: "row", gap: 10 },
  card: { flex: 1, gap: 6, padding: 14, borderRadius: radius.rl, borderWidth: 1.5 },
  tile: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  group: { gap: 10 },
  list: { gap: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 50, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1.5 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingHorizontal: 20, borderTopWidth: 1 },
  flex: { flex: 1 },
});
