import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { fmtDate } from "@/shared/lib/format";
import { keyOf, monthCells, todayKey } from "@/shared/lib/pro/dates";
import { selectHaptic } from "@/shared/lib/haptics";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { PressableScale } from "../PressableScale";
import { BottomSheet, SheetScroll } from "../sheet";
import { Text } from "../Text";
import { TriggerBox } from "./TriggerBox";

const parse = (v: string): { y: number; m: number; d: number } | null => {
  const x = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  return x ? { y: +x[1], m: +x[2] - 1, d: +x[3] } : null;
};

// A date picked, not typed: a field that opens a sheet with a month grid (Monday first, today ringed, the chosen day filled) and
// month arrows. The value is "YYYY-MM-DD"; `min` / `max` grey out days outside them; `years` adds year arrows (dates far in the past,
// such as when a job started); `clearable` adds a way back to "no date".
export function DatePickerField({ label, value, onChange, error, min, max, years, clearable }: { label?: string; value: string; onChange: (v: string) => void; error?: string; min?: string; max?: string; years?: boolean; clearable?: boolean }) {
  const { t, tList, locale } = useT();
  const c = useColors();
  const [open, setOpen] = useState(false);
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const show = () => { const p = parse(value); setYm(p ? { y: p.y, m: p.m } : { y: now.getFullYear(), m: now.getMonth() }); setOpen(true); };
  const step = (d: number) => setYm(({ y, m }) => ({ y: y + Math.floor((m + d) / 12), m: (m + d + 12) % 12 }));
  const today = todayKey();
  const pick = (k: string) => { selectHaptic(); onChange(k); setOpen(false); };
  return (
    <>
      <TriggerBox label={label} icon="calendar" text={parse(value) ? fmtDate(`${value}T12:00:00`, locale) : ""} empty={t("cal.empty")} error={error} onPress={show} />
      <BottomSheet visible={open} onClose={() => setOpen(false)} title={t("cal.pickDate")} snaps={[0.72, 0.9]}>
        <SheetScroll>
          <View style={s.nav}>
            {years ? <IconButton icon="chevrons-left" size={40} label={String(ym.y - 1)} onPress={() => step(-12)} /> : null}
            <IconButton icon="chevron-left" size={40} onPress={() => step(-1)} />
            <Text variant="h4" center style={s.title}>{`${tList("aw11.months")[ym.m] ?? ""} ${ym.y}`}</Text>
            <IconButton icon="chevron-right" size={40} onPress={() => step(1)} />
            {years ? <IconButton icon="chevrons-right" size={40} label={String(ym.y + 1)} onPress={() => step(12)} /> : null}
          </View>
          <View style={s.grid}>
            {tList("aw11.weekdays").map((w, i) => <Text key={w} variant="caption" tone={i >= 5 ? "err" : "gray"} weight="semibold" center style={s.cell}>{w}</Text>)}
            {monthCells(ym.y, ym.m).map((cell) => {
              const on = cell.key === value;
              const off = (!!min && cell.key < min) || (!!max && cell.key > max);
              return (
                <PressableScale key={cell.key} disabled={off} haptic={false} onPress={() => pick(cell.key)} accessibilityRole="button" accessibilityState={{ selected: on, disabled: off }} accessibilityLabel={cell.key} style={s.cell}>
                  <View style={[s.day, on && { backgroundColor: c.accent }, !on && cell.key === today && { borderColor: c.accent, borderWidth: 1.5 }]}>
                    <Text variant="body" weight="semibold" style={{ color: on ? "#FFFFFF" : off || cell.other ? c.gray2 : c.ink, opacity: off ? 0.5 : 1 }}>{cell.day}</Text>
                  </View>
                </PressableScale>
              );
            })}
          </View>
          {!max || today <= max ? <Button title={t("aw6.today")} variant="soft" full onPress={() => pick(keyOf(now.getFullYear(), now.getMonth(), now.getDate()))} /> : null}
          {clearable && value ? <Button title={t("cal.clear")} icon="x" variant="line" full onPress={() => { onChange(""); setOpen(false); }} /> : null}
        </SheetScroll>
      </BottomSheet>
    </>
  );
}

const s = StyleSheet.create({
  nav: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { flex: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "14.2857%", paddingVertical: 2 },
  day: { height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
});
