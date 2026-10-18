import { StyleSheet, View } from "react-native";
import { brand, useColors } from "@/shared/theme";
import { PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { monthCells, type YMD } from "../lib/dateParts";

type Props = { y: number; m: number; picked: YMD | null; today: YMD; onPick: (d: number) => void };

// One month, Monday first. Weekday names come from the translations.
export function CalendarGrid({ y, m, picked, today, onPick }: Props) {
  const c = useColors();
  const { tList } = useT();
  const cells = monthCells(y, m);
  const same = (p: YMD | null, d: number) => !!p && p.y === y && p.m === m && p.d === d;
  return (
    <View>
      <View style={s.row}>
        {tList("dc3.weekdays").map((w) => <Text key={w} variant="caption" tone="gray" center style={s.cell}>{w}</Text>)}
      </View>
      <View style={s.wrap}>
        {cells.map((d, i) =>
          d === null ? <View key={i} style={s.cell} /> : (
            <PressableScale key={i} onPress={() => onPick(d)} style={[s.cell, s.day, same(picked, d) && { backgroundColor: brand.b600 }, same(today, d) && !same(picked, d) && { borderColor: c.accent, borderWidth: 1.5 }]}>
              <Text variant="small" weight="semibold" tone={same(picked, d) ? "white" : "ink"} center>{d}</Text>
            </PressableScale>
          ),
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", marginBottom: 6 },
  wrap: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: `${100 / 7}%`, alignItems: "center", justifyContent: "center", height: 44 },
  day: { borderRadius: 22 },
});
