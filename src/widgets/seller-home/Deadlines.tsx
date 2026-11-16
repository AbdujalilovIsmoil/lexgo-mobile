import { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import type { CabinetCase } from "@/entities/pro-workspace";
import { PressableScale, Text } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const MAX = 4;
const DAY = 86_400_000;

// "Yaqin muddatlar" (Adliya): the open cases with the nearest deadlines (from today on), as rows of one white card — the days left on a
// tinted tile (red for today or tomorrow), the next step or the title, the case number · the date. A tap opens the case. Nothing when none.
export function Deadlines({ cases }: { cases: CabinetCase[] }) {
  const { t, tList } = useT();
  const { colors: c, dark, glass } = useTheme();
  const router = useRouter();
  const [now] = useState(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); });
  const months = tList("aw11.months");
  const rows = cases
    .filter((x) => x.deadlineAt && Date.parse(x.deadlineAt.slice(0, 10)) >= now - DAY / 2)
    .sort((a, b) => a.deadlineAt.localeCompare(b.deadlineAt))
    .slice(0, MAX);
  if (!rows.length) return null;
  const line = dark || glass ? c.line : "#E9EEF5";
  return (
    <View style={s.col}>
      <Text variant="h4" weight="bold" style={s.h}>{t("cdash.pro.deadlines")}</Text>
      <View style={[s.card, { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E6EBF3" }, !glass && s.shadow]}>
        {rows.map((x, i) => {
          const d = new Date(`${x.deadlineAt.slice(0, 10)}T00:00:00`);
          const left = Math.max(0, Math.round((d.getTime() - now) / DAY));
          const hot = left <= 1;
          const date = `${d.getDate()}-${(months[d.getMonth()] ?? "").toLowerCase()}`;
          return (
            <PressableScale key={x.id} onPress={() => router.push(`/pro/cases/${x.id}` as never)} scale={0.99} accessibilityRole="button" accessibilityLabel={`${x.nextAction || x.title}, ${left} ${t("cdash.pro.days")}`} style={[s.row, i > 0 && { borderTopWidth: 1, borderTopColor: line }]}>
              <View style={[s.tile, { backgroundColor: hot ? c.errBg : c.tint2 }]}>
                <Text weight="bold" style={[s.n, { color: hot ? c.err : c.accent }]}>{left || "!"}</Text>
                <Text variant="caption" weight="semibold" style={{ color: hot ? c.err : c.accent }}>{left ? t("cdash.pro.days") : t("cdash.pro.todayShort")}</Text>
              </View>
              <View style={s.txt}>
                <Text variant="body" weight="semibold" numberOfLines={2} style={s.title}>{x.nextAction || x.title}</Text>
                <Text variant="small" tone="gray" numberOfLines={1}>{[x.number, date].filter(Boolean).join(" · ")}</Text>
              </View>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  h: { fontSize: 19, lineHeight: 25 },
  card: { borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
  tile: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  n: { fontSize: 19, lineHeight: 22 },
  txt: { flex: 1, minWidth: 0, gap: 3 },
  title: { fontSize: 15.5, lineHeight: 21 },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, default: { elevation: 1 } })!,
});
