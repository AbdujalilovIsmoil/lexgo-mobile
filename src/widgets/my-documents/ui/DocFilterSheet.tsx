import { StyleSheet, View } from "react-native";
import { BottomSheet, Button, Icon, IconButton, PressableScale, SheetScroll, Text, type IconName } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { selectHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { MODE_ICON, toneOf, useToneColor, type DocMode } from "@/entities/my-document";

type Opt<V> = { value: V; label: string };
type Props = {
  visible: boolean;
  onClose: () => void;
  mode: "" | DocMode;
  status: string;
  modes: Opt<"" | DocMode>[];
  states: Opt<string>[];
  statusCounts: Record<string, number>;
  total: number;
  onMode: (m: "" | DocMode) => void;
  onStatus: (s: string) => void;
  onReset: () => void;
};

function Check({ on }: { on: boolean }) {
  const c = useColors();
  return <View style={[s.radio, { borderColor: on ? c.accent : c.gray2, backgroundColor: on ? c.accent : "transparent" }]}>{on ? <Icon name="check" size={13} color="#FFFFFF" /> : null}</View>;
}

// The two secondary filters, laid out for thumbs: how the document was made as four icon cards, its exact status as a
// list with a coloured dot and a live count, and a bar that stays put with "Tozalash" and the number of results.
export function DocFilterSheet({ visible, onClose, mode, status, modes, states, statusCounts, total, onMode, onStatus, onReset }: Props) {
  const { t } = useT();
  const c = useColors();
  const color = useToneColor();
  const insets = useInsets();
  const all = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("dm11.filters")} snaps={[0.84, 0.94]}>
      <View style={s.fill}>
        <SheetScroll>
          <View style={s.group}>
            <Text variant="small" tone="gray">{t("dm11.fMode")}</Text>
            <View style={s.grid}>
              {modes.map((m) => {
                const on = mode === m.value;
                const icon: IconName = m.value ? MODE_ICON[m.value] : "layers";
                return (
                  <PressableScale key={m.value || "all"} haptic={false} onPress={() => { selectHaptic(); onMode(m.value); }} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.card, { backgroundColor: on ? c.tint2 : c.surface2, borderColor: on ? c.accent : c.line }]}>
                    <View style={[s.tile, { backgroundColor: on ? c.accent : c.surface }]}><Icon name={icon} size={18} color={on ? "#FFFFFF" : c.accent} /></View>
                    <Text variant="small" weight="semibold" numberOfLines={2} style={s.flex}>{m.label}</Text>
                  </PressableScale>
                );
              })}
            </View>
          </View>
          {states.length > 2 ? (
            <View style={s.group}>
              <Text variant="small" tone="gray">{t("dm11.fStatus")}</Text>
              <View style={s.list}>
                {states.map((m) => {
                  const on = status === m.value;
                  const n = m.value ? statusCounts[m.value] ?? 0 : all;
                  return (
                    <PressableScale key={m.value || "all"} haptic={false} onPress={() => { selectHaptic(); onStatus(m.value); }} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.row, { backgroundColor: on ? c.tint2 : "transparent", borderColor: on ? c.accent : "transparent" }]}>
                      {m.value ? <View style={[s.dot, { backgroundColor: color(toneOf(m.value)) }]} /> : <Icon name="layers" size={16} color={c.accent} />}
                      <Text variant="body" weight={on ? "bold" : "regular"} numberOfLines={1} style={s.flex}>{m.label}</Text>
                      <Text variant="caption" tone="gray">{n}</Text>
                      <Check on={on} />
                    </PressableScale>
                  );
                })}
              </View>
            </View>
          ) : null}
        </SheetScroll>
        <View style={[s.bar, { borderTopColor: c.line, paddingBottom: insets.bottom + 14 }]}>
          <IconButton icon="rotate-ccw" size={48} label={t("dm1.reset")} onPress={onReset} />
          <Button title={`${t("dm11.fShow")} · ${total}`} variant="gradient" full onPress={onClose} style={s.flex} />
        </View>
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  group: { gap: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: { flexBasis: "48%", flexGrow: 1, flexDirection: "row", alignItems: "center", gap: 10, minHeight: 64, padding: 10, borderRadius: radius.r, borderWidth: 1.5 },
  tile: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  list: { gap: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 50, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1.5 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14, paddingHorizontal: 20, borderTopWidth: 1 },
  flex: { flex: 1 },
});
