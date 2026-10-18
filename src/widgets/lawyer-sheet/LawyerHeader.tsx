import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import type { Lawyer } from "@/entities/lawyer";
import { Avatar, Icon, Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Name, kind, region, display id and the verified / ad / new / busy badges.
export function LawyerHeader({ lawyer }: { lawyer: Lawyer }) {
  const c = useColors();
  const { t } = useT();
  const key = `lawyers.regions.${lawyer.region}`;
  const region = lawyer.region && t(key) !== key ? t(key) : lawyer.region;
  return (
    <View style={s.row}>
      <Avatar name={lawyer.name} size={68} square />
      <View style={s.col}>
        <View style={s.name}>
          <Text variant="h3" numberOfLines={2} style={s.flex}>{lawyer.name}</Text>
          {lawyer.verified ? <Icon name="check-circle" size={20} color={c.accent} /> : null}
        </View>
        <Text variant="small" tone="gray" numberOfLines={1}>{t(lawyer.kind === "advocate" ? "lawyers.card.kindAdvocate" : "lawyers.card.kindLawyer")}{region ? ` · ${region}` : ""}</Text>
        {lawyer.publicId ? <Text variant="caption" tone="gray2">{lawyer.publicId}</Text> : null}
        <View style={s.pills}>
          {lawyer.promoted ? <Pill label={lawyer.promotedService ? t("mk1.adService", { service: lawyer.promotedService }) : t("mk1.ad")} tone="cy" icon="trending-up" small /> : null}
          {lawyer.isNew ? <Pill label={t("common.new")} tone="ok" small /> : null}
          {lawyer.available ? null : <Pill label={t("mk1.busy")} tone="warn" small />}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 14, alignItems: "center" },
  col: { flex: 1, gap: 3 },
  name: { flexDirection: "row", alignItems: "center", gap: 6 },
  flex: { flexShrink: 1 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
});
