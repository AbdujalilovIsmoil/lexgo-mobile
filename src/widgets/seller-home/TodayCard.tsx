import { useState, type ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Calendar } from "lucide-react-native";
import { PressableScale, Text } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Num = { key: string; value: number; label: string; to: string };

// "Bugun · 13-noyabr, juma" (Adliya): the day's three numbers side by side — calendar items, tasks (an advokat's open tasks, a yurist's cases
// due), deadlines — each opening its list; the calendar button in the corner; `alert` (the order waiting for an answer) as the navy strip at
// the foot.
export function TodayCard({ nums, alert }: { nums: Num[]; alert?: ReactNode }) {
  const { t, tList } = useT();
  const { colors: c, dark, glass } = useTheme();
  const router = useRouter();
  const [now] = useState(() => new Date());
  const months = tList("aw11.months");
  const day = t(`sl8.day.${(now.getDay() + 6) % 7}`); // Monday first, as the working-hours page names them
  const date = [`${now.getDate()}-${(months[now.getMonth()] ?? "").toLowerCase()}`, day.toLowerCase()].filter(Boolean).join(", ");
  const line = dark || glass ? c.line : "#E9EEF5";
  return (
    <View style={[s.card, { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E6EBF3" }, !glass && s.shadow]}>
      <View style={s.head}>
        <Text variant="h4" weight="bold" numberOfLines={1} style={s.title}>{t("cdash.pro.today", { date })}</Text>
        <PressableScale onPress={() => router.push("/pro/calendar" as never)} scale={0.94} hitSlop={6} accessibilityRole="button" accessibilityLabel={t("cdash.pro.calendar")} style={[s.cal, { backgroundColor: c.tint2 }]}>
          <Calendar size={19} color={c.accent} />
        </PressableScale>
      </View>
      <View style={s.nums}>
        {nums.map((n, i) => (
          <PressableScale key={n.key} onPress={() => router.push(n.to as never)} scale={0.97} accessibilityRole="button" accessibilityLabel={`${n.value} ${n.label}`} style={[s.num, i > 0 && { borderLeftWidth: 1, borderLeftColor: line, paddingLeft: 16 }]}>
            <Text weight="bold" style={[s.value, { color: c.ink }]}>{n.value}</Text>
            <Text variant="small" tone="gray">{n.label}</Text>
          </PressableScale>
        ))}
      </View>
      {alert}
    </View>
  );
}

const s = StyleSheet.create({
  card: { padding: 18, gap: 16, borderRadius: 22, borderWidth: 1 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { flex: 1, fontSize: 17, lineHeight: 22 },
  cal: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  nums: { flexDirection: "row" },
  num: { flex: 1, gap: 2 },
  value: { fontSize: 28, lineHeight: 34 },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } }, default: { elevation: 2 } })!,
});
