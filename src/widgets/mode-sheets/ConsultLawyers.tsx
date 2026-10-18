import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useLawyers, type Lawyer } from "@/entities/lawyer";
import { Avatar, Button, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Lawyers to book a consultation with: three first, "show more" for the rest.
export function ConsultLawyers({ onOpen }: { onOpen: (l: Lawyer) => void }) {
  const { t } = useT();
  const { data } = useLawyers({ area: "" });
  const [shown, setShown] = useState(3);
  if (!data?.length) return null;
  return (
    <View style={s.col}>
      <Text variant="h4">{t("topics.lawyers")}</Text>
      {data.slice(0, shown).map((l) => (
        <PressableScale key={l.id} onPress={() => onOpen(l)} scale={0.985} style={s.row}>
          <Avatar name={l.name} size={42} square />
          <View style={s.info}>
            <Text variant="body" weight="semibold" numberOfLines={1}>{l.name}</Text>
            <Text variant="caption" tone="gray">{l.rated ? `★ ${l.rating.toFixed(1)} · ` : ""}{t("lawyers.card.reviews", { count: l.reviews, years: l.experienceYears })}</Text>
          </View>
        </PressableScale>
      ))}
      {data.length > shown ? <Button title={`${t("svc.showMore")} · ${data.length - shown}`} onPress={() => setShown(shown + 5)} variant="soft" size="sm" full /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10, marginTop: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  info: { flex: 1, gap: 2 },
});
