import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { GradientBox, Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// .aicard: the dark "Yordam kerakmi?" card at the bottom with a glass button to the AI chat.
export function DashAiCard() {
  const { t } = useT();
  const router = useRouter();
  return (
    <GradientBox variant="dark" round={20} style={s.card}>
      <View style={s.h}><Icon name="star" size={18} tone="white" /><Text variant="h4" tone="white">{t("cdash.sideAiTitle")}</Text></View>
      <Text variant="small" style={s.p}>{t("cdash.sideAiSub")}</Text>
      <PressableScale style={s.btn} onPress={() => router.navigate("/(tabs)/ai")}>
        <Text variant="small" weight="bold" tone="white">{t("cdash.sideAiCta")}</Text>
        <Icon name="arrow-right" size={16} tone="white" />
      </PressableScale>
    </GradientBox>
  );
}

const s = StyleSheet.create({
  card: { marginHorizontal: 16, marginTop: 16, padding: 20, gap: 10 },
  h: { flexDirection: "row", alignItems: "center", gap: 8 },
  p: { color: "#C4DEFF" },
  btn: { flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 999, paddingHorizontal: 16, height: 40 },
});
