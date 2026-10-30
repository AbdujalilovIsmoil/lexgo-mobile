import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useAiTheme } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { GuestLimit } from "@/entities/chat";

// Under a guest's answer: what is left, straight from `limit_status`; a register nudge on the last ones.
export function LimitHint({ limit }: { limit: GuestLimit }) {
  const aiTheme = useAiTheme();
  const { t } = useT();
  const router = useRouter();
  return (
    <View style={s.row}>
      <Icon name="info" size={14} color={aiTheme.muted} />
      <Text variant="caption" style={[s.text, { color: aiTheme.muted }]}>{t("ax1.hint", { today: limit.remainingToday, total: limit.remainingTotal })}</Text>
      {limit.registerOffer ? (
        <PressableScale onPress={() => router.push("/auth/register")} accessibilityRole="button">
          <Text variant="caption" weight="semibold" style={{ color: aiTheme.accent }}>{limit.registeredFree > 0 ? t("ax1.registerMore", { n: limit.registeredFree }) : t("ax1.registerPlain")}</Text>
        </PressableScale>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap", paddingHorizontal: 6, marginTop: 2 },
  text: { flexShrink: 1 },
});
