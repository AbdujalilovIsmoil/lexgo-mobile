import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { fmtDate } from "@/shared/lib/format";
import { selectHaptic } from "@/shared/lib/haptics";
import { monthCells, todayKey } from "@/shared/lib/pro/dates";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { IconButton } from "../IconButton";
import { PressableScale } from "../PressableScale";
import { Text } from "../Text";

type Props = { from: string; to: string; onChange: (from: string, to: string) => void };

const ym = (key: string) => (/^\d{4}-\d{2}/.test(key) ? { y: +key.slice(0, 4), m: +key.slice(5, 7) - 1 } : null);

// A period picked on a month grid, right inside the sheet: tap the first day, then the last (earlier than the first swaps them).
// A third tap starts over. The two boxes on top show the range; the one waiting for a tap is outlined.
export function RangeCalendar({ from, to, onChange }: Props) {
  const { tList, t, locale } = useT();
  const c = useColors();
  const now = new Date();
  const [view, setView] = useState(() => ym(from) ?? { y: now.getFullYear(), m: now.getMonth() });
  const today = todayKey();
  const step = (d: number) => setView(({ y, m }) => ({ y: y + Math.floor((m + d) / 12), m: (m + d + 12) % 12 }));
  const pick = (k: string) => {
    selectHaptic();
    if (!from || to) onChange(k, "");
    else if (k < from) onChange(k, from);
    else onChange(from, k);
  };
  const waiting = !from ? "from" : !to ? "to" : "";
  const box = (label: string, value: string, key: "from" | "to") => (
    <View style={[s.box, { borderColor: waiting === key ? c.accent : c.line, backgroundColor: c.surface }]}>
      <Text variant="caption" tone="gray">{label}</Text>
      <Text variant="body" weight="semibold" tone={value ? "ink" : "gray2"} numberOfLines={1}>{value ? fmtDate(`${value}T12:00:00`, locale) : "—"}</Text>
    </View>
  );
  return (
    <View style={s.wrap}>
      <View style={s.boxes}>{box(t("adm.from"), from, "from")}{box(t("adm.to"), to, "to")}</View>
      <View style={s.nav}>
        <IconButton icon="chevron-left" size={40} onPress={() => step(-1)} />
        <Text variant="h4" center style={s.title}>{`${tList("aw11.months")[view.m] ?? ""} ${view.y}`}</Text>
        <IconButton icon="chevron-right" size={40} onPress={() => step(1)} />
      </View>
      <View style={s.grid}>
        {tList("aw11.weekdays").map((w, i) => <Text key={w} variant="caption" tone={i >= 5 ? "err" : "gray"} weight="semibold" center style={s.cell}>{w}</Text>)}
        {monthCells(view.y, view.m).map((cell) => {
          const end = to || from;
          const edge = cell.key === from || cell.key === end;
          const inside = !!from && !!end && cell.key > from && cell.key < end;
          return (
            <PressableScale key={cell.key} haptic={false} onPress={() => pick(cell.key)} accessibilityRole="button" accessibilityState={{ selected: edge }} accessibilityLabel={cell.key} style={s.cell}>
              <View style={[s.band, inside && { backgroundColor: c.tint2 }, edge && !!to && from !== to && { backgroundColor: c.tint2, [cell.key === from ? "left" : "right"]: "50%" }]} />
              <View style={[s.day, edge && { backgroundColor: c.accent }, !edge && cell.key === today && { borderColor: c.accent, borderWidth: 1.5 }]}>
                <Text variant="body" weight="semibold" style={{ color: edge ? "#FFFFFF" : cell.other ? c.gray2 : c.ink }}>{cell.day}</Text>
              </View>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 10 },
  boxes: { flexDirection: "row", gap: 10 },
  box: { flex: 1, borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, gap: 2 },
  nav: { flexDirection: "row", alignItems: "center" },
  title: { flex: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: `${100 / 7}%`, height: 44, alignItems: "center", justifyContent: "center" },
  band: { position: "absolute", top: 4, bottom: 4, left: 0, right: 0 },
  day: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
