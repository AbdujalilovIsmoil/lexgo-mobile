import { Platform, StyleSheet, View } from "react-native";
import { Text } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { useGeoLabels, type Lawyer } from "@/entities/lawyer";
import { AchievementsSection } from "./AchievementsSection";

// "Mutaxassis haqida" in a white card: the heading and the bio, the practice areas as chips and the organization. Education,
// bar association and licence are private (TZ.md public lawyer privacy) and never shown here.
export function AboutPanel({ lawyer: l }: { lawyer: Lawyer }) {
  const { t } = useT();
  const { colors: c, dark, glass } = useTheme();
  const geo = useGeoLabels();
  const chip = { backgroundColor: dark || glass ? c.surface2 : "#F6F8FB", borderColor: dark || glass ? c.line : "#E2E8F1" };
  return (
    <View style={s.stack}>
      <View style={[s.card, { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E6EBF3" }, !glass && s.shadow]}>
      <View style={s.group}>
        <Text variant="h4" weight="bold" style={s.h}>{t("mkd.about")}</Text>
        <Text variant="body" tone={l.bio ? "gray" : "gray2"} style={s.bio}>{l.bio || t("mkd.noBio")}</Text>
      </View>
      {l.specializations.length ? (
        <View style={s.group}>
          <Text variant="h4" weight="bold" style={s.h}>{t("mkd.specializations")}</Text>
          <View style={s.chips}>{l.specializations.map((x) => <View key={x} style={[s.chip, chip]}><Text variant="small" weight="semibold">{geo.area(x)}</Text></View>)}</View>
        </View>
      ) : null}
      {l.organizationName ? (
        <View style={s.group}>
          <Text variant="h4" weight="bold" style={s.h}>{t("mkd.organization")}</Text>
          <Text variant="body" tone="gray" style={s.bio}>{l.organizationName}</Text>
        </View>
      ) : null}
      </View>
      <AchievementsSection sellerId={l.userId} />
    </View>
  );
}

const s = StyleSheet.create({
  stack: { gap: 14 },
  card: { padding: 16, gap: 18, borderRadius: 20, borderWidth: 1 },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, default: { elevation: 1 } })!,
  group: { gap: 8 },
  h: { fontSize: 18, lineHeight: 24 },
  bio: { fontSize: 15.5, lineHeight: 23 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 7 },
});
