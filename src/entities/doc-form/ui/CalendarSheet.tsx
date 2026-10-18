import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { BottomSheet, Button, Chip, IconButton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { fmtDoc, parseDoc, today, type YMD } from "../lib/dateParts";
import { CalendarGrid } from "./CalendarGrid";

type Props = { visible: boolean; title: string; value: string; onClose: () => void; onPick: (v: string) => void };

const YEARS = Array.from({ length: 111 }, (_, i) => new Date().getFullYear() + 10 - i);

// Month calendar with a year picker (birth dates need years far back).
export function CalendarSheet({ visible, title, value, onClose, onPick }: Props) {
  const { t, tList } = useT();
  const now = today();
  const picked = parseDoc(value);
  const [view, setView] = useState({ y: now.y, m: now.m });
  const [years, setYears] = useState(false);
  useSheetReset(visible, () => {
    setView({ y: picked?.y ?? now.y, m: picked?.m ?? now.m });
    setYears(false);
  });
  const step = (n: number) => setView((v) => ({ y: v.y + Math.floor((v.m - 1 + n) / 12), m: ((v.m - 1 + n + 12) % 12) + 1 }));
  const choose = (d: YMD) => {
    onPick(fmtDoc(d));
    onClose();
  };
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title} snaps={[0.62]}>
      <View style={s.body}>
        <View style={s.head}>
          <IconButton icon="chevron-left" size={40} onPress={() => step(-1)} />
          <Chip label={`${tList("dc3.months")[view.m - 1] ?? ""} ${view.y}`} active={years} onPress={() => setYears(!years)} />
          <IconButton icon="chevron-right" size={40} onPress={() => step(1)} />
        </View>
        {years ? (
          <ScrollView contentContainerStyle={s.years}>
            {YEARS.map((y) => <Chip key={y} label={String(y)} active={y === view.y} onPress={() => { setView({ ...view, y }); setYears(false); }} />)}
          </ScrollView>
        ) : (
          <CalendarGrid y={view.y} m={view.m} picked={picked} today={now} onPick={(d) => choose({ y: view.y, m: view.m, d })} />
        )}
        <Button title={t("dc3.today")} variant="soft" onPress={() => choose(now)} full />
        <Text variant="caption" tone="gray" center>{t("dc3.dateFormat")}</Text>
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 18, gap: 12 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  years: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingBottom: 12 },
});
