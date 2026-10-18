import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { brand, radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// The way in for legal professionals, as one card instead of a long link: a briefcase badge on the brand gradient, a short
// title ("Join as a specialist"), a line on what it gives, and a chevron. A tap opens sign-up as an advocate (the role can be
// changed there). It is shown wherever a visitor chooses between signing in and signing up.
export function SpecialistInvite() {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  return (
    <PressableScale onPress={() => router.push({ pathname: "/auth/register", params: { role: "advokat" } })} accessibilityRole="button" accessibilityLabel={t("au1.asSpecialist")} style={[s.card, { backgroundColor: c.tint, borderColor: c.line }]}>
      <LinearGradient colors={[brand.b700, brand.b600, "#0E9FD0"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.badge}>
        <Icon name="briefcase" size={22} tone="white" />
      </LinearGradient>
      <View style={s.txt}>
        <Text variant="body" weight="bold" numberOfLines={1}>{t("au1.proTitle")}</Text>
        <Text variant="caption" tone="gray" numberOfLines={2}>{t("au1.proSub")}</Text>
      </View>
      <Icon name="chevron-right" size={20} color={c.accent} />
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: radius.rl, borderWidth: 1 },
  badge: { width: 46, height: 46, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  txt: { flex: 1, gap: 2 },
});
