import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Pill, Text, type IconName, type PillTone } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { complaintStage, type ComplaintItem, type ComplaintStage } from "../model/complaint";
import { complaintParts } from "../lib/complaintParts";
import { useComplaintLabels } from "../model/useComplaintLabels";

export const STAGE_TONE: Record<ComplaintStage, PillTone> = { new: "warn", review: "blue", rework: "cy", resolved: "ok", rejected: "err", closed: "gray" };
export const CATEGORY_ICON: Record<string, IconName> = { service: "briefcase", lawyer: "user", payment: "credit-card", quality: "star", sla: "clock" };
export const COMPLAINT_TILE = 46;

// One complaint as a flat row (hairlines divide the rows): a category tile tinted by the stage, title, meta (kind, id, linked
// work, date), the first line of the text and the stage pill (pulsing while it is still being handled).
export function ComplaintRowCard({ item, onPress }: { item: ComplaintItem; onPress: () => void }) {
  const c = useColors();
  const { t, locale } = useT();
  const L = useComplaintLabels();
  const { quality: q, title, meta, line } = complaintParts(item, L, t, locale);
  const stage = complaintStage(item.status);
  const tint = { new: c.warn, review: c.accent, rework: "#00CFE8", resolved: c.ok, rejected: c.err, closed: c.gray2 }[stage];
  return (
    <PressableScale onPress={onPress} style={s.row}>
      <View style={[s.tile, { backgroundColor: `${tint}24` }]}><Icon name={q ? "star" : CATEGORY_ICON[item.category] ?? "message-circle"} size={20} color={tint} /></View>
      <View style={s.body}>
        <View style={s.top}>
          <Text variant="body" weight="bold" numberOfLines={1} style={s.flex}>{title}</Text>
          <Pill label={L.tag(item.status)} tone={STAGE_TONE[stage]} small live={["new", "review", "rework"].includes(stage)} />
        </View>
        <Text variant="caption" tone="gray2" numberOfLines={1}>{meta}</Text>
        <Text variant="small" tone="gray" numberOfLines={2}>{line}</Text>
      </View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, paddingVertical: 12 },
  tile: { width: COMPLAINT_TILE, height: COMPLAINT_TILE, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, gap: 3 },
  top: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
});
