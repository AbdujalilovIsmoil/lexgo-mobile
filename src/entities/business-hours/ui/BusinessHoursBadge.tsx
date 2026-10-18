import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { daysLabel, hoursState } from "../lib/status";
import { useBusinessHours } from "../model/queries";

// Call-center hours chip (web BusinessHoursBadge; `inline` drops the box, as inside the support menu): status dot, status word, schedule and,
// while the office is shut, the optional note.
export function BusinessHoursBadge({ note, inline, onDark }: { note?: string; inline?: boolean; onDark?: boolean }) {
  const c = useColors();
  const { t, locale } = useT();
  const bh = useBusinessHours();
  const state = hoursState(bh);
  const dot = state === "open" ? c.ok : state === "closed" ? c.warn : c.gray;
  return (
    <View style={[s.box, inline ? s.flat : { backgroundColor: onDark ? "rgba(255,255,255,0.12)" : c.surface2 }]}>
      <View style={s.head}>
        <View style={[s.dot, { backgroundColor: dot }]} />
        <Text variant="caption" weight="bold" tone={onDark ? "white" : "ink"}>{t(`cxBh.${state}`)}</Text>
      </View>
      <Text variant="caption" tone={onDark ? undefined : "gray"} style={onDark ? { color: "#C4DEFF" } : undefined}>{t("cxBh.schedule", { days: daysLabel(bh.days, locale), start: bh.start, end: bh.end })}</Text>
      {note && state !== "open" ? <Text variant="caption" tone="gray">{note}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  box: { gap: 3, padding: 10, borderRadius: 12 },
  flat: { padding: 0, marginTop: 2 },
  head: { flexDirection: "row", alignItems: "center", gap: 7 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
