import { StyleSheet, View } from "react-native";
import { workTone, useWorkText, type WorkEvent } from "@/entities/work";
import { useColors } from "@/shared/theme";
import { Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";

// Status history, oldest first, ending in the current state.
export function WorkTimeline({ events }: { events: WorkEvent[] }) {
  const c = useColors();
  const { t, locale } = useT();
  const text = useWorkText();
  const dot = { warn: c.warn, blue: c.accent, cy: c.accent, ok: c.ok, gray: c.gray2, err: c.err } as const;
  if (!events.length) return null;
  return (
    <SectionCard title={t("cl4.timeline.title")}>
      {events.map((e, i) => {
        const last = i === events.length - 1;
        const created = e.status === "created";
        return (
          <View key={e.key} style={s.row}>
            <View style={s.rail}>
              <View style={[s.dot, { backgroundColor: created ? c.gray2 : dot[workTone(e.status)] }, last && s.big]} />
              {!last ? <View style={[s.line, { backgroundColor: c.line }]} /> : null}
            </View>
            <View style={s.col}>
              <Text variant="small" weight={last ? "bold" : "semibold"}>{created ? t("cl4.timeline.created") : text.status(e.status)}</Text>
              {e.at ? <Text variant="caption" tone="gray2">{fmtDateTime(e.at, locale)}</Text> : null}
              {e.note ? <Text variant="caption" tone="gray">{e.note}</Text> : null}
            </View>
          </View>
        );
      })}
    </SectionCard>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  rail: { alignItems: "center", width: 14 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  big: { width: 14, height: 14, borderRadius: 7, marginTop: 2 },
  line: { width: 2, flex: 1, marginVertical: 2, minHeight: 18 },
  col: { flex: 1, gap: 1, paddingBottom: 12 },
});
