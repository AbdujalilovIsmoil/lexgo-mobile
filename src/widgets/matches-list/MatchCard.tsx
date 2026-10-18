import { StyleSheet, View } from "react-native";
import type { MyMatch } from "@/entities/lawyer";
import { useGeoLabels } from "@/entities/lawyer";
import { fmtRating } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { Button, Card, Icon, Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// One recommended specialist: match ring, name + kind, rating / region / area, AI reason, "Ko'rish".
export function MatchCard({ match: m, onView }: { match: MyMatch; onView: () => void }) {
  const c = useColors();
  const { t, locale } = useT();
  const geo = useGeoLabels();
  const pct = Math.min(m.pct, 100);
  return (
    <Card style={s.card}>
      <View style={[s.ring, { borderColor: c.accent, backgroundColor: c.tint }]}>
        <Text variant="small" weight="bold" tone="accent">{pct}%</Text>
      </View>
      <View style={s.body}>
        <View style={s.top}>
          <Text variant="body" weight="bold" numberOfLines={1} style={s.flex}>{m.name || "—"}</Text>
          <Pill label={t(`cxMt.kind.${m.kind}`)} tone={m.kind === "advocate" ? "blue" : "cy"} small />
        </View>
        <View style={s.meta}>
          <View style={s.item}><Icon name="star" size={13} color={c.warn} /><Text variant="caption" tone="gray">{fmtRating(m.rating, locale)}</Text></View>
          {m.region ? <View style={s.item}><Icon name="map-pin" size={13} color={c.gray} /><Text variant="caption" tone="gray">{geo.region(m.region)}</Text></View> : null}
          {m.area ? <Text variant="caption" tone="gray" numberOfLines={1}>{geo.area(m.area)}</Text> : null}
        </View>
        {m.reason ? <Text variant="small" tone="gray">{m.reason}</Text> : null}
        <Button title={t("cxMt.view")} size="sm" full onPress={onView} />
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  ring: { width: 56, height: 56, borderRadius: 28, borderWidth: 4, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, gap: 8 },
  top: { flexDirection: "row", alignItems: "center", gap: 8 },
  meta: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 },
  item: { flexDirection: "row", alignItems: "center", gap: 4 },
  flex: { flex: 1 },
});
