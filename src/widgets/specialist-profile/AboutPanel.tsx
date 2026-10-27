import { StyleSheet, View } from "react-native";
import { Pill, Text } from "@/shared/ui";
import { ProfileSection } from "@/shared/ui/profile";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { humanizeSlug } from "@/shared/lib/format";
import type { Lawyer } from "@/entities/lawyer";
import { AchievementsSection } from "./AchievementsSection";

function Block({ label, value }: { label: string; value?: string }) {
  const c = useColors();
  return value ? <View style={[s.block, { backgroundColor: c.surface2 }]}><Text variant="caption" tone="gray" weight="bold" style={s.cap}>{label}</Text><Text variant="body" weight="bold">{value}</Text></View> : null;
}

// "Mutaxassis haqida": the bio, the practice areas as chips and the organization. Education, bar association and licence are private
// (TZ.md public lawyer privacy) and never shown here.
export function AboutPanel({ lawyer: l }: { lawyer: Lawyer }) {
  const { t } = useT();
  return (
    <View style={s.stack}>
      <ProfileSection accent="blue" icon="user" title={t("mkd.about")}>
        <Text variant="body" tone={l.bio ? "ink" : "gray2"}>{l.bio || t("mkd.noBio")}</Text>
        {l.specializations.length ? (
          <View style={s.group}>
            <Text variant="caption" tone="gray" weight="bold" style={s.cap}>{t("mkd.specializations")}</Text>
            <View style={s.chips}>{l.specializations.map((x) => <Pill key={x} label={humanizeSlug(x)} tone="blue" />)}</View>
          </View>
        ) : null}
        <Block label={t("mkd.organization")} value={l.organizationName} />
      </ProfileSection>
      <AchievementsSection sellerId={l.userId} />
    </View>
  );
}

const s = StyleSheet.create({
  stack: { gap: 14 },
  group: { gap: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  block: { gap: 4, padding: 14, borderRadius: 16 },
  cap: { textTransform: "uppercase", letterSpacing: 1 },
});
