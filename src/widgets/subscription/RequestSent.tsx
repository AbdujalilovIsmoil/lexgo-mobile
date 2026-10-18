import { StyleSheet, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// The receipt after a Telegram request: a green check that pops in, the message and the SUB-xxxx number to quote.
export function RequestSent({ workId }: { workId: string }) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={s.wrap}>
      <Animated.View entering={ZoomIn.springify().damping(12)}>
        <LinearGradient colors={["#00A870", "#34D399"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.badge}><Icon name="check" size={38} tone="white" /></LinearGradient>
      </Animated.View>
      <Text variant="h3" center>{t("tgp.tgSent")}</Text>
      <Text variant="small" tone="gray" center>{t("tgp.tgSentLead")}</Text>
      {workId ? <View style={[s.id, { backgroundColor: c.tint2 }]}><Text variant="caption" tone="gray">ID</Text><Text variant="body" weight="bold" selectable>{workId}</Text></View> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: "center", gap: 10, paddingVertical: 12 },
  badge: { width: 84, height: 84, borderRadius: 42, alignItems: "center", justifyContent: "center" },
  id: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8, marginTop: 4 },
});
