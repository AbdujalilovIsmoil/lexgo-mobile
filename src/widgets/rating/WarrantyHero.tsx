import { View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Icon, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// What the page itself can state: no service is open here, so no guarantee is promised — a service's guarantees are the backend's and
// shown on its page (K32/K33 §14). Only how a request runs.
const FACTS: [IconName, string][] = [["shield", "srt.w.terms"], ["clock", "srt.w.review"], ["list", "srt.w.status"]];

// "LexGo Kafolati": hero, the plain facts of a request, the request block (button → sheet) and the claims title.
export function WarrantyHero({ onRequest }: { onRequest: () => void }) {
  const c = useColors();
  const { t } = useT();
  const router = useRouter();
  return (
    <View style={{ gap: 12, paddingBottom: 12 }}>
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: c.tint2, alignItems: "center", justifyContent: "center" }}><Icon name="shield" size={22} tone="accent" /></View>
        <View style={{ flex: 1 }}>
          <Text variant="h4">{t("pwr.wr.title")}</Text>
          <Text variant="small" tone="gray">{t("srt.w.subtitle")}</Text>
        </View>
      </View>
      <Card tinted style={{ gap: 8 }}>
        {FACTS.map(([icon, key]) => <View key={key} style={{ flexDirection: "row", gap: 8, alignItems: "center" }}><Icon name={icon} size={16} tone="accent" /><Text variant="small" style={{ flex: 1 }}>{t(key)}</Text></View>)}
      </Card>
      {/* A marketplace order's warranty is asked from that order (POST …/orders/{id}/warranty), never from this general form. */}
      <Card tinted style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}><Icon name="shopping-bag" size={16} tone="accent" /><Text variant="small" style={{ flex: 1 }}>{t("mf.wr.orderHint")}</Text></View>
        <Button title={t("mf.wr.toOrders")} icon="arrow-right" variant="soft" size="sm" onPress={() => router.push("/(tabs)/orders" as never)} />
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
