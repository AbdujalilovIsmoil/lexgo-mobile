import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { kindIcon, kindTint, StatusBadge, useUrgentLabels, type UrgentRequest } from "@/entities/urgent";
import { useT } from "@/shared/i18n";
import { openTel } from "@/shared/lib/links";
import { radius, useColors } from "@/shared/theme";
import { Avatar, Icon, IconButton, Pill, Text } from "@/shared/ui";
import { AgeChip } from "./AgeChip";
import { useHeat } from "./heat";
import { StageTrack } from "./StageTrack";

// The top of the record: service and work id, status and SLA, the big "time since the request" chip, the stage track and the client.
export function DetailHero({ req }: { req: UrgentRequest }) {
  const { t } = useT();
  const c = useColors();
  const label = useUrgentLabels();
  const { edge } = useHeat(req);
  const tint = kindTint(req.serviceKind);
  const name = req.clientName || t("ugx.unknownClient");
  return (
    <View style={[s.card, { borderColor: `${edge}55`, backgroundColor: c.surface }]}>
      <LinearGradient colors={[`${edge}33`, "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={s.row}>
        <View style={[s.ico, { backgroundColor: `${tint}26` }]}><Icon name={kindIcon(req.serviceKind)} size={22} color={tint} /></View>
        <View style={s.flex}>
          <Text variant="h4" numberOfLines={2}>{label.kind(req.serviceKind, req.serviceTitle)}</Text>
          {req.workId ? <Text variant="caption" tone="gray">{req.workId}</Text> : null}
        </View>
      </View>
      <View style={s.pills}>
        <StatusBadge status={req.status} small={false} />
        {req.slaBreached ? <Pill tone="err" icon="alert-triangle" label={t("ugx.sla")} /> : null}
        {req.immediateCall ? <Pill tone="warn" icon="zap" label={t("ug4.now")} /> : null}
        {req.viaOperator ? <Pill tone="cy" icon="headphones" label={t("ug4.byOperator")} /> : null}
      </View>
      <View style={s.age}><Text variant="caption" tone="gray">{t("ugx.since")}</Text><AgeChip req={req} big /></View>
      <StageTrack req={req} />
      <View style={[s.client, { backgroundColor: c.surface2 }]}>
        <Avatar name={name} size={42} />
        <View style={s.flex}>
          <Text variant="body" weight="bold" numberOfLines={1}>{name}</Text>
          {req.clientPhone ? <Text variant="small" tone="gray" selectable>{req.clientPhone}</Text> : null}
        </View>
        {req.clientPhone ? <IconButton icon="phone" label={t("adm.call")} onPress={() => openTel(req.clientPhone)} /> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { gap: 14, padding: 16, borderRadius: radius.rl, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  flex: { flex: 1 },
  ico: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  age: { gap: 6, alignItems: "flex-start" },
  client: { flexDirection: "row", alignItems: "center", gap: 12, padding: 10, borderRadius: 18 },
});
