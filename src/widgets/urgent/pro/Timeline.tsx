import { StyleSheet, View } from "react-native";
import { useUrgentLabels, type UrgentRequest } from "@/entities/urgent";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { Text } from "@/shared/ui";
import { Card } from "./Card";
import { useHeat } from "./heat";

// Every stage the record went through with its time; the latest one is lit in the record's colour.
export function Timeline({ req }: { req: UrgentRequest }) {
  const { t, locale } = useT();
  const c = useColors();
  const label = useUrgentLabels();
  const { edge } = useHeat(req);
  const steps = req.history.map((h) => ({ name: label.status(h.to), at: h.at }));
  if (!steps.length && req.status && req.status !== "open_pool") steps.push({ name: label.status(req.status), at: req.completedAt || req.cancelledAt || req.scheduledAt });
  const items = [{ name: t("ugx.tlCreated"), at: req.createdAt }, ...steps];
  return (
    <Card icon="activity" title={t("ugx.timeline")}>
      {items.map((x, i) => {
        const last = i === items.length - 1;
        return (
          <View key={`${x.name}-${i}`} style={s.row}>
            <View style={s.rail}>
              <View style={[s.dot, { backgroundColor: last ? edge : c.surface2, borderColor: last ? `${edge}55` : c.line }]} />
              {last ? null : <View style={[s.line, { backgroundColor: c.line }]} />}
            </View>
            <View style={s.text}>
              <Text variant="small" weight={last ? "bold" : "semibold"} tone={last ? "ink" : "gray"}>{x.name}</Text>
              <Text variant="caption" tone="gray2">{fmtDateTime(x.at, locale) || "—"}</Text>
            </View>
          </View>
        );
      })}
    </Card>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  rail: { alignItems: "center", width: 16 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, marginTop: 2 },
  line: { flex: 1, width: 2, marginVertical: 2 },
  text: { flex: 1, gap: 1, paddingBottom: 14 },
});
