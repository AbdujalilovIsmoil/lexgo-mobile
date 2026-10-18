import { StyleSheet, View } from "react-native";
import { Button, Card, Icon, Text } from "@/shared/ui";
import { LinearGradient } from "expo-linear-gradient";
import { gradient, radius, shadows } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// "No services yet": icon tile, text and the first-service action (as on the web).
export function ServicesEmpty({ onAdd }: { onAdd: () => void }) {
  const { t } = useT();
  return (
    <Card style={s.card}>
      <LinearGradient colors={[...gradient.primary]} locations={[...gradient.primaryStops]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.tile, shadows.blue]}>
        <Icon name="briefcase" size={30} tone="white" />
      </LinearGradient>
      <View style={s.text}>
        <Text variant="h3" center>{t("proSvc.empty.title")}</Text>
        <Text variant="small" tone="gray" center>{t("proSvc.empty.text")}</Text>
      </View>
      <Button title={t("proSvc.add")} icon="plus" variant="primary" onPress={onAdd} style={s.btn} />
    </Card>
  );
}

const s = StyleSheet.create({
  card: { alignItems: "center", gap: 16, paddingVertical: 36, paddingHorizontal: 20 },
  tile: { width: 64, height: 64, borderRadius: radius.rl, alignItems: "center", justifyContent: "center" },
  text: { gap: 6, maxWidth: 320 },
  btn: { alignSelf: "center" }, // Button pins itself to the start edge; this puts it in the middle
});
