import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { tOr } from "@/shared/lib/pro/tOr";
import { hhmm } from "@/shared/lib/pro/dates";
import { radius, useColors } from "@/shared/theme";
import { Icon, Pill, PressableScale, Text } from "@/shared/ui";
import { isCancelled, tintOf } from "../lib/types";
import type { CalEvent } from "../model/types";

// One calendar entry as a card: the start time (and end) in a column on the left, a bar in the type's colour, the title, the type
// and place, the date when asked, and a "cancelled" mark that also strikes the title through.
export function EventRow({ event, withDate, onPress, index = 0 }: { event: CalEvent; withDate?: boolean; onPress: () => void; index?: number }) {
  const { t, locale } = useT();
  const c = useColors();
  const tint = tintOf(event.type);
  const off = isCancelled(event);
  const deadline = event.type.endsWith("deadline");
  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 40).duration(240)}>
      <PressableScale onPress={onPress} scale={0.985} accessibilityRole="button" accessibilityLabel={`${event.title}. ${hhmm(event.startsAt)}`} style={[s.card, { backgroundColor: c.surface, borderColor: c.line, opacity: off ? 0.6 : 1 }]}>
        <View style={s.time}>
          <Text variant="body" weight="bold">{hhmm(event.startsAt) || "—"}</Text>
          {event.endsAt ? <Text variant="caption" tone="gray2">{hhmm(event.endsAt)}</Text> : null}
        </View>
        <View style={[s.bar, { backgroundColor: tint }]} />
        <View style={s.body}>
          <Text variant="small" weight="bold" numberOfLines={2} style={off ? s.strike : undefined}>{event.title}</Text>
          <View style={s.meta}>
            <View style={[s.chip, { backgroundColor: `${tint}22` }]}><Icon name={event.type === "hearing" ? "briefcase" : deadline ? "flag" : "calendar"} size={12} color={tint} /><Text variant="caption" weight="bold" style={{ color: tint }}>{tOr(t, `aw11.eventType.${event.type}`, event.type)}</Text></View>
            {withDate ? <View style={s.row}><Icon name="calendar" size={12} tone="gray" /><Text variant="caption" tone="gray">{fmtDate(event.startsAt, locale)}</Text></View> : null}
            {event.location ? <View style={s.row}><Icon name="map-pin" size={12} tone="gray" /><Text variant="caption" tone="gray" numberOfLines={1} style={s.loc}>{event.location}</Text></View> : null}
            {event.reminderScheduled && event.reminderMinutes ? <Icon name="bell" size={12} tone="gray" /> : null}
          </View>
        </View>
        {off ? <Pill small tone="err" label={t("aw6.cancelled")} /> : null}
      </PressableScale>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: radius.rl, borderWidth: 1 },
  time: { width: 46, alignItems: "center", gap: 1 },
  bar: { width: 4, alignSelf: "stretch", borderRadius: 2 },
  body: { flex: 1, gap: 6 },
  strike: { textDecorationLine: "line-through" },
  meta: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 1 },
  loc: { flexShrink: 1 },
});
