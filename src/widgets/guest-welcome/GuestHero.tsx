import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { AiOrb } from "@/features/ai-chat";
import { GradientBox, Text } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

// Dark header with the living orb, the welcome line and a one-sentence promise.
export function GuestHero() {
  const { t } = useT();
  const insets = useInsets();
  return (
    <GradientBox variant="dark" round={0} style={[s.hero, { paddingTop: insets.top + 8 }]}>
      <StatusBar style="light" />
      <AiOrb size={190} />
      <View style={s.copy}>
        <Text variant="h2" tone="white" center>{t("guest.title")}</Text>
        <Text variant="small" center style={s.sub}>{t("guest.sub")}</Text>
      </View>
    </GradientBox>
  );
}

const s = StyleSheet.create({
  hero: { alignItems: "center", paddingBottom: 30, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  copy: { gap: 8, paddingHorizontal: 28, marginTop: -6 },
  sub: { color: "#C4DEFF" },
});
