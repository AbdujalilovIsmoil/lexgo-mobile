import { StyleSheet, View } from "react-native";
import { CATEGORY_ICON, complaintParts, complaintStage, useComplaintLabels, type ComplaintItem, type ComplaintStage } from "@/entities/rating";
import { Icon, LiveDot, PressableScale, Text } from "@/shared/ui";
import { brand, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// One complaint as a card: a spine and a tile in the colour of its stage (waiting amber, review blue, rework cyan,
// resolved green, rejected red, closed grey), the title, a stage chip, the meta line and the first lines of the text.
export function ComplaintTile({ item, onPress }: { item: ComplaintItem; onPress: () => void }) {
  const { t, locale } = useT();
  const c = useColors();
  const L = useComplaintLabels();
  const p = complaintParts(item, L, t, locale);
  const tone: Record<ComplaintStage, string> = { new: c.warn, review: brand.b600, rework: "#00A6E6", resolved: c.ok, rejected: c.err, closed: c.gray };
  const stage = complaintStage(item.status);
  const col = tone[stage];
  const live = stage === "new" || stage === "review" || stage === "rework";
  return (
    <PressableScale onPress={onPress} scale={0.985} accessibilityRole="button" accessibilityLabel={p.title} style={[s.card, { backgroundColor: c.surface, borderColor: c.line }]}>
      <View style={[s.spine, { backgroundColor: col }]} />
      <View style={[s.ico, { backgroundColor: `${col}26` }]}><Icon name={p.quality ? "star" : CATEGORY_ICON[item.category] ?? "message-circle"} size={19} color={col} /></View>
      <View style={s.col}>
        <View style={s.head}>
          <Text variant="body" weight="bold" numberOfLines={2} style={s.title}>{p.title}</Text>
          <View style={[s.chip, { backgroundColor: `${col}24` }]}>{live ? <LiveDot color={col} size={6} /> : null}<Text variant="caption" weight="bold" style={{ color: col }}>{L.tag(item.status)}</Text></View>
        </View>
        <Text variant="caption" tone="gray2" numberOfLines={2}>{p.meta}</Text>
        {p.quality ? <View style={s.q}><Icon name="star" size={12} tone="accent" /><Text variant="caption" tone="accent" weight="semibold">{t("pwc.filter.quality")}</Text></View> : null}
        <Text variant="small" tone="gray" numberOfLines={2}>{p.line}</Text>
      </View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14, paddingLeft: 18, borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  spine: { position: "absolute", left: 0, top: 0, bottom: 0, width: 5 },
  ico: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 4 },
  head: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  title: { flex: 1 },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3, marginTop: 1 },
  q: { flexDirection: "row", alignItems: "center", gap: 4 },
});
