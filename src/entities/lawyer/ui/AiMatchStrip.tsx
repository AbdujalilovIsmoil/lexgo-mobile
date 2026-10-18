import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { AiMatch } from "../model/marketTypes";

// Why the AI picked this specialist: match %, a bar and up to three reasons.
export function AiMatchStrip({ match }: { match: AiMatch }) {
  const c = useColors();
  const { t } = useT();
  const pct = Math.round(match.score * 100);
  return (
    <View style={[s.box, { backgroundColor: c.tint, borderColor: c.line }]}>
      <View style={s.head}>
        <Icon name="zap" size={14} color={c.accent} />
        <Text variant="small" weight="bold" tone="accent">{pct > 0 ? t("mk1.aiMatch", { pct }) : t("mk1.aiPick")}</Text>
      </View>
      {pct > 0 ? <View style={[s.track, { backgroundColor: c.line }]}><View style={[s.fill, { backgroundColor: c.accent, width: `${pct}%` }]} /></View> : null}
      {match.reasons.slice(0, 3).map((r) => (
        <View key={r} style={s.reason}>
          <Text variant="caption" tone="accent">•</Text>
          <Text variant="caption" tone="gray" style={s.flex}>{r}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  box: { borderRadius: 14, borderWidth: 1, padding: 12, gap: 7 },
  head: { flexDirection: "row", alignItems: "center", gap: 6 },
  track: { height: 5, borderRadius: 3, overflow: "hidden" },
  fill: { height: 5, borderRadius: 3 },
  reason: { flexDirection: "row", gap: 6 },
  flex: { flex: 1 },
});
