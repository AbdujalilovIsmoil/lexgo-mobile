import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { IconButton, PressableScale, Text } from "@/shared/ui";
import { fmtDate } from "@/shared/lib/format";
import { brand, radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { weekDays } from "./lib/week";

type Props = { anchor: Date; counts: Map<string, number>; value: string | null; onChange: (key: string | null) => void; onShift: (n: number) => void };

// Seven day chips (Monday first): today is ringed, a dot sits under the days that have meetings, tap a day to show only
// it (tap again for all). The arrows move by a week; the month and year are on the left.
export function WeekStrip({ anchor, counts, value, onChange, onShift }: Props) {
  const { t, locale } = useT();
  const c = useColors();
  const days = useMemo(() => weekDays(anchor, new Date()), [anchor]);
  const mid = days[3].date;
  const tag = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "uz-UZ";
  const month = mid.toLocaleDateString(tag, { month: "long", year: "numeric" });
  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <Text variant="h4" style={s.month} numberOfLines={1}>{month.charAt(0).toUpperCase() + month.slice(1)}</Text>
        <IconButton icon="chevron-left" size={40} label={t("meetUx.weekPrev")} onPress={() => onShift(-1)} />
        <IconButton icon="chevron-right" size={40} label={t("meetUx.weekNext")} onPress={() => onShift(1)} />
      </View>
      <View style={s.days}>
        {days.map((d, i) => {
          const on = value === d.key;
          const n = counts.get(d.key) ?? 0;
          const has = n > 0;
          const fg = on ? "#FFFFFF" : d.today ? c.accent : c.ink;
          return (
            <PressableScale
              key={d.key}
              scale={0.94}
              haptic={false}
              onPress={() => onChange(on ? null : d.key)}
              accessibilityRole="button"
              accessibilityLabel={t("meetUx.dayA11y", { date: fmtDate(d.date.toISOString(), locale), n })}
              accessibilityState={{ selected: on }}
              style={[s.chip, { backgroundColor: on ? brand.b600 : "transparent", borderColor: d.today && !on ? c.accent : "transparent" }]}
            >
              <Text variant="caption" weight="medium" style={{ color: on ? "#E6F0FF" : c.gray }}>{t(`meetUx.wd${i}`)}</Text>
              <Text variant="h4" weight="bold" style={{ color: fg }}>{d.num}</Text>
              <View style={[s.mark, { backgroundColor: has ? (on ? "#FFFFFF" : c.accent) : "transparent" }]} />
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 6 },
  head: { flexDirection: "row", alignItems: "center", gap: 4 },
  month: { flex: 1 },
  days: { flexDirection: "row", gap: 4 },
  chip: { flex: 1, minHeight: 64, alignItems: "center", justifyContent: "center", gap: 2, borderRadius: radius.r, borderWidth: 1.5, paddingVertical: 6 },
  mark: { width: 5, height: 5, borderRadius: 3 },
});
