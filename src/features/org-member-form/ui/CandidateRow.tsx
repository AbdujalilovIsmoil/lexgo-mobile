import { StyleSheet, View } from "react-native";
import { Avatar, Icon, PressableScale, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { OrgStatus, useOrgText, type Candidate } from "@/entities/organization";

type Props = { c: Candidate; on: boolean; member: boolean; onPress: () => void };

// A seller from the directory: tap to pick; sellers already in the organization are dimmed.
export function CandidateRow({ c, on, member, onPress }: Props) {
  const col = useColors();
  const { t } = useT();
  const text = useOrgText();
  return (
    <PressableScale onPress={onPress} disabled={member} style={[s.row, { borderColor: on ? col.accent : col.line, backgroundColor: on ? col.tint : col.surface }, member && { opacity: 0.5 }]}>
      <Avatar name={c.name} size={38} />
      <View style={s.col}>
        <Text variant="body" weight="bold" numberOfLines={1}>{c.name}</Text>
        <Text variant="caption" tone="gray" numberOfLines={1}>{[text.kind(c.kind), c.reviews > 0 ? `★ ${c.rating.toFixed(1)}` : ""].filter(Boolean).join(" · ")}</Text>
      </View>
      {member ? <Text variant="caption" tone="gray">{t("og3.already")}</Text> : on ? <Icon name="check-circle" size={20} color={col.accent} /> : <OrgStatus status={c.verification} />}
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 10, borderRadius: 16, borderWidth: 1.5 },
  col: { flex: 1, gap: 1 },
});
