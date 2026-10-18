import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { gradient, radius, shadows } from "@/shared/theme";
import { Icon, IconButton, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { year: number; month: number; onStep: (d: number) => void; onToday: () => void; thisMonth: number; today: number; next: number; onAdd: () => void; onCalc: () => void };

// The top of the calendar on the dark gradient: the month with previous / next arrows and a "today" pill, three numbers (events this
// month, today, upcoming) and the two things you do here — add an event (white) and the deadline calculator (glass).
export function CalHero({ year, month, onStep, onToday, thisMonth, today, next, onAdd, onCalc }: Props) {
  const { t, tList } = useT();
  const cells = [[thisMonth, t("cal.month")], [today, t("cal.today")], [next, t("cal.next")]] as const;
  return (
    <LinearGradient colors={[...gradient.dark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.card, shadows.s2]}>
      <View style={s.ring} pointerEvents="none" />
      <View style={s.nav}>
        <IconButton icon="chevron-left" size={38} tone="glass" onPress={() => onStep(-1)} />
        <View style={s.mid}>
          <Text variant="h3" tone="white" center>{tList("aw11.months")[month] ?? ""}</Text>
          <Text variant="caption" center style={s.year}>{year}</Text>
        </View>
        <IconButton icon="chevron-right" size={38} tone="glass" onPress={() => onStep(1)} />
        <PressableScale onPress={onToday} accessibilityRole="button" style={s.today}><Text variant="caption" weight="bold" tone="white">{t("aw6.today")}</Text></PressableScale>
      </View>
      <View style={s.stats}>
        {cells.map(([n, label], i) => (
          <View key={label} style={[s.stat, i ? s.sep : null]}>
            <Text variant="h2" tone="white">{n}</Text>
            <Text variant="caption" numberOfLines={2} style={s.lbl}>{label}</Text>
          </View>
        ))}
      </View>
      <View style={s.actions}>
        <PressableScale onPress={onAdd} accessibilityRole="button" style={[s.btn, s.primary]}><Icon name="plus" size={17} color="#0B1F45" /><Text variant="small" weight="bold" style={s.dark}>{t("cal.add")}</Text></PressableScale>
        <PressableScale onPress={onCalc} accessibilityRole="button" style={[s.btn, s.glass]}><Icon name="clock" size={17} tone="white" /><Text variant="small" weight="bold" tone="white" numberOfLines={1}>{t("cal.calc")}</Text></PressableScale>
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: { gap: 14, padding: 14, borderRadius: radius.rl, overflow: "hidden" },
  ring: { position: "absolute", width: 200, height: 200, borderRadius: 100, borderWidth: 24, borderColor: "rgba(255,255,255,0.07)", right: -60, top: -70 },
  nav: { flexDirection: "row", alignItems: "center", gap: 8 },
  mid: { flex: 1 },
  year: { color: "#B7CDEC" },
  today: { paddingHorizontal: 12, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.18)" },
  stats: { flexDirection: "row" },
  stat: { flex: 1, gap: 2, paddingLeft: 12 },
  sep: { borderLeftWidth: 1, borderLeftColor: "rgba(255,255,255,0.18)" },
  lbl: { color: "#C4DEFF" },
  actions: { flexDirection: "row", gap: 10 },
  btn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 46, borderRadius: 23 },
  primary: { backgroundColor: "#FFFFFF" },
  dark: { color: "#0B1F45" },
  glass: { backgroundColor: "rgba(255,255,255,0.16)", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
});
