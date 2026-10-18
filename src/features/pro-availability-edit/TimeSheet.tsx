import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { rangeValid, toMin, withPart } from "@/entities/pro-availability";
import { radius, useColors } from "@/shared/theme";
import { Chip, IconButton, Text } from "@/shared/ui";
import { FormSheet } from "@/shared/ui/admin";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  value: string;
  which: "start" | "end";
  other: string; // the other end of the range, to check the order
  onPick: (hm: string) => void;
};

const QUICK = ["00", "15", "30", "45"];
const two = (n: number) => String(n).padStart(2, "0");

// HH:MM chooser: large − / + steppers for the hour (1 h) and the minutes (5 min), quick minute chips, live range check.
export function TimeSheet({ visible, onClose, title, value, which, other, onPick }: Props) {
  const { t } = useT();
  const c = useColors();
  const [hm, setHm] = useState("09:00");
  useSheetReset(visible, () => setHm(Number.isNaN(toMin(value)) ? "09:00" : value));
  const mins = toMin(hm);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ok = which === "start" ? rangeValid(hm, other) : rangeValid(other, hm);
  const set = (part: "h" | "m", n: number) => setHm((cur) => withPart(cur, part, n));
  const col = (part: "h" | "m", n: number, max: number, step: number, up: string, down: string) => (
    <View style={s.col}>
      <IconButton icon="chevron-up" size={48} label={t(up)} onPress={() => set(part, Math.max(n, Math.min(max, Math.floor(n / step) * step + step)))} />
      <View style={[s.num, { backgroundColor: c.surface2, borderColor: ok ? c.line : c.err }]}>
        <Text variant="hx" style={!ok ? { color: c.err } : undefined}>{two(n)}</Text>
      </View>
      <IconButton icon="chevron-down" size={48} label={t(down)} onPress={() => set(part, Math.max(0, Math.ceil(n / step) * step - step))} />
    </View>
  );
  return (
    <FormSheet visible={visible} onClose={onClose} title={title} onSubmit={() => { onPick(hm); onClose(); }} submitLabel={t("adm.apply")} disabled={!ok} snaps={[0.6]}>
      <View style={s.pick}>
        {col("h", h, 23, 1, "availUx.hourUp", "availUx.hourDown")}
        <Text variant="hx" tone="gray">:</Text>
        {col("m", m, 55, 5, "availUx.minUp", "availUx.minDown")}
      </View>
      <View style={s.quick}>{QUICK.map((x) => <Chip key={x} label={`:${x}`} active={two(m) === x} onPress={() => set("m", Number(x))} />)}</View>
      {!ok ? <Text variant="small" center style={{ color: c.err }}>{t("availUx.sheetBad")}</Text> : null}
    </FormSheet>
  );
}

const s = StyleSheet.create({
  pick: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 14 },
  col: { alignItems: "center", gap: 8 },
  num: { minWidth: 96, minHeight: 64, borderRadius: radius.r, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  quick: { flexDirection: "row", justifyContent: "center", gap: 8, flexWrap: "wrap" },
});
