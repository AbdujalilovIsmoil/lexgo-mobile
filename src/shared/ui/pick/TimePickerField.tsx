import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { selectHaptic } from "@/shared/lib/haptics";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { Button } from "../Button";
import { PressableScale } from "../PressableScale";
import { BottomSheet, SheetScroll } from "../sheet";
import { Text } from "../Text";
import { TriggerBox } from "./TriggerBox";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const pad = (n: number) => String(n).padStart(2, "0");
const parse = (v: string): { h: number; m: number } | null => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(v);
  return m && +m[1] < 24 && +m[2] < 60 ? { h: +m[1], m: +m[2] } : null;
};

function Cell({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  const c = useColors();
  return (
    <PressableScale haptic={false} onPress={() => { selectHaptic(); onPress(); }} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.cell, { backgroundColor: on ? c.accent : c.surface2, borderColor: on ? c.accent : c.line }]}>
      <Text variant="body" weight="bold" style={{ color: on ? "#FFFFFF" : c.ink }}>{label}</Text>
    </PressableScale>
  );
}

// A time picked, not typed: a field that opens a sheet with the hours (00–23) as a grid and the minutes in steps (5 by default).
// The value is "HH:MM"; `clearable` adds a way back to "not set" (an optional end time).
export function TimePickerField({ label, value, onChange, error, step = 5, clearable }: { label?: string; value: string; onChange: (v: string) => void; error?: string; step?: 5 | 10 | 15 | 30; clearable?: boolean }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const cur = parse(value);
  const [h, setH] = useState(cur?.h ?? 9);
  const [m, setM] = useState(cur ? Math.round(cur.m / step) * step % 60 : 0);
  const show = () => { const p = parse(value); setH(p?.h ?? 9); setM(p ? Math.round(p.m / step) * step % 60 : 0); setOpen(true); };
  const minutes = Array.from({ length: 60 / step }, (_, i) => i * step);
  return (
    <>
      <TriggerBox label={label} icon="clock" text={cur ? `${pad(cur.h)}:${pad(cur.m)}` : ""} empty={t("cal.empty")} error={error} onPress={show} />
      <BottomSheet visible={open} onClose={() => setOpen(false)} title={t("cal.pickTime")} snaps={[0.72, 0.9]}>
        <SheetScroll>
          <Text variant="h2" center>{pad(h)}:{pad(m)}</Text>
          <Text variant="small" tone="gray">{t("cal.hour")}</Text>
          <View style={s.grid}>{HOURS.map((x) => <View key={x} style={s.w6}><Cell label={pad(x)} on={h === x} onPress={() => setH(x)} /></View>)}</View>
          <Text variant="small" tone="gray">{t("cal.minutes")}</Text>
          <View style={s.grid}>{minutes.map((x) => <View key={x} style={s.w6}><Cell label={pad(x)} on={m === x} onPress={() => setM(x)} /></View>)}</View>
          <View style={s.bar}>
            {clearable && value ? <Button title="✕" variant="line" onPress={() => { onChange(""); setOpen(false); }} /> : null}
            <Button title={t("cal.done")} variant="gradient" full style={s.flex} onPress={() => { onChange(`${pad(h)}:${pad(m)}`); setOpen(false); }} />
          </View>
        </SheetScroll>
      </BottomSheet>
    </>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  w6: { width: "14.6%" },
  cell: { height: 46, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  bar: { flexDirection: "row", gap: 10, marginTop: 6 },
  flex: { flex: 1 },
});
