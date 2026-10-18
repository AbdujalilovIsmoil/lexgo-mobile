import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Avatar, Card, Icon, Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { humanizeSlug } from "@/shared/lib/format";
import type { Lawyer } from "../model/types";
import type { AiMatch } from "../model/marketTypes";
import { AiMatchStrip } from "./AiMatchStrip";
import { RatingRow } from "./RatingRow";
import { ServiceTitles } from "./ServiceTitles";
import { LawyerCardFooter } from "./LawyerCardFooter";

type Props = { lawyer: Lawyer; onPress: () => void; compact?: boolean; match?: AiMatch };

// Mobile take on .advcard: avatar, name + verified tick, kind/region, rating, price.
export function LawyerCard({ lawyer, onPress, compact, match }: Props) {
  const c = useColors();
  const { t } = useT();
  const kind = t(lawyer.kind === "advocate" ? "lawyers.card.kindAdvocate" : "lawyers.card.kindLawyer");
  return (
    <Card onPress={onPress} style={[s.card, compact && s.compact]}>
      <View style={s.top}>
        <Avatar name={lawyer.name} size={compact ? 48 : 56} square />
        <View style={s.info}>
          <View style={s.nameRow}>
            <Text variant="h4" numberOfLines={1} style={s.name}>
              {lawyer.name}
            </Text>
            {lawyer.verified ? <Icon name="check-circle" size={16} color={c.accent} /> : null}
          </View>
          <Text variant="caption" tone="gray" numberOfLines={1}>
            {kind}
            {lawyer.region ? ` · ${[lawyer.region, lawyer.district && lawyer.district.toLowerCase() !== "demo" ? lawyer.district : ""].filter(Boolean).join(", ")}` : ""}
          </Text>
          <RatingRow lawyer={lawyer} />
        </View>
      </View>
      {!compact && (lawyer.promoted || lawyer.isNew || lawyer.specializations.length) ? (
        <View style={s.pills}>
          {lawyer.promoted ? <Pill label={t("mk1.ad")} tone="cy" icon="trending-up" small /> : null}
          {lawyer.isNew ? <Pill label={t("common.new")} tone="ok" small /> : null}
          {lawyer.specializations.slice(0, 2).map((sp) => (
            <Pill key={sp} label={humanizeSlug(sp)} tone="gray" small />
          ))}
        </View>
      ) : null}
      {compact ? null : <ServiceTitles lawyer={lawyer} />}
      {match ? <AiMatchStrip match={match} /> : null}
      <LawyerCardFooter lawyer={lawyer} />
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 12 },
  compact: { width: 280 },
  top: { flexDirection: "row", gap: 12 },
  info: { flex: 1, gap: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { flexShrink: 1 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
});
