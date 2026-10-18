import { View } from "react-native";
import { Button, Card, Icon, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// "LexGo Kafolati": hero, the three promises, the request block (button → sheet) and the claims title.
export function WarrantyHero({ onRequest }: { onRequest: () => void }) {
  const c = useColors();
  const { t } = useT();
  return (
    <View style={{ gap: 12, paddingBottom: 12 }}>
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: c.tint2, alignItems: "center", justifyContent: "center" }}><Icon name="shield" size={22} tone="accent" /></View>
        <View style={{ flex: 1 }}>
          <Text variant="h4">{t("pwr.wr.title")}</Text>
          <Text variant="small" tone="gray">{t("pwr.wr.subtitle")}</Text>
        </View>
      </View>
      <Card tinted style={{ gap: 8 }}>
        {(["p1", "p2", "p3"] as const).map((k) => <View key={k} style={{ flexDirection: "row", gap: 8, alignItems: "center" }}><Icon name="check-circle" size={16} color={c.ok} /><Text variant="small" style={{ flex: 1 }}>{t(`py10.w.${k}`)}</Text></View>)}
      </Card>
      <Card style={{ gap: 10 }}>
        <Text variant="body" weight="bold">{t("pwr.wr.requestTitle")}</Text>
        <Text variant="small" tone="gray">{t("pwr.wr.requestLead")}</Text>
        <Button title={t("py10.w.send")} icon="refresh-cw" variant="gradient" full onPress={onRequest} />
      </Card>
      <Text variant="h4">{t("pwr.wr.claimsTitle")}</Text>
    </View>
  );
}
