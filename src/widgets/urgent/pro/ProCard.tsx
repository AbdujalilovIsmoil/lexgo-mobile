import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { detailHref, kindIcon, kindTint, useUrgentLabels, type UrgentRequest } from "@/entities/urgent";
import { useRouter } from "expo-router";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";
import { radius, useColors } from "@/shared/theme";
import { Button, Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { AgeChip } from "./AgeChip";
import { useHeat } from "./heat";
import { StageTrack } from "./StageTrack";

function Chip({ icon, label, color }: { icon: IconName; label: string; color?: string }) {
  const c = useColors();
  return <View style={[s.chip, { backgroundColor: c.surface2 }]}><Icon name={icon} size={13} color={color ?? c.gray} /><Text variant="caption" tone="gray" numberOfLines={1} style={color ? { color } : undefined}>{label}</Text></View>;
}

// An urgency-first card: a coloured edge, the service and the big "time since the request" chip, the client's words as the headline quote,
// where / how / who as chips, the stage track with the current step lit, and one full-width "Batafsil".
export function ProCard({ req }: { req: UrgentRequest }) {
  const { t, locale } = useT();
  const c = useColors();
  const router = useRouter();
  const label = useUrgentLabels();
  const [full, setFull] = useState(false);
  const { edge } = useHeat(req);
  const tint = kindTint(req.serviceKind);
  const open = () => router.push(detailHref("pro", req.id));
  return (
    <View style={[s.card, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
      <View style={[s.edge, { backgroundColor: edge }]} />
      <View style={s.body}>
        <View style={s.head}>
          <View style={[s.ico, { backgroundColor: `${tint}22` }]}><Icon name={kindIcon(req.serviceKind)} size={18} color={tint} /></View>
          <View style={s.flex}>
            <Text variant="body" weight="bold" numberOfLines={1}>{label.kind(req.serviceKind, req.serviceTitle)}</Text>
            <Text variant="caption" tone="gray" numberOfLines={1}>{[req.workId, req.clientName].filter(Boolean).join(" · ")}</Text>
          </View>
        </View>
        <AgeChip req={req} big />
        <PressableScale scale={0.99} onPress={() => setFull((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: full }} style={[s.quote, { backgroundColor: c.surface2, borderLeftColor: edge }]}>
          <Text variant="body" weight="medium" numberOfLines={full ? undefined : 3}>{req.need || t("ug7.noNeed")}</Text>
        </PressableScale>
        <View style={s.chips}>
          {req.directions.slice(0, 2).map((d, i) => <Chip key={`${d}-${i}`} icon="tag" label={label.dir(d)} color={c.accent} />)}
          {req.region ? <Chip icon="map-pin" label={label.region(req.region)} /> : null}
          {req.channel ? <Chip icon={req.channel === "chat" ? "message-circle" : "video"} label={label.channel(req.channel)} /> : null}
          {req.scheduledAt ? <Chip icon="calendar" label={fmtDateTime(req.scheduledAt, locale)} /> : null}
          {req.slaBreached ? <Chip icon="alert-triangle" label={t("ugx.sla")} color={c.err} /> : null}
        </View>
        <StageTrack req={req} />
        <Button title={t("ugx.details")} icon="chevron-right" iconRight variant="gradient" full onPress={open} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", borderRadius: radius.rl, borderWidth: 1, overflow: "hidden" },
  edge: { width: 6 },
  body: { flex: 1, gap: 12, padding: 14 },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  flex: { flex: 1 },
  ico: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  quote: { padding: 12, borderRadius: 14, borderLeftWidth: 3 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, maxWidth: "100%" },
});
