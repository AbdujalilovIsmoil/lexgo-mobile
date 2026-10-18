import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import type { User } from "@/entities/session";
import { Card, Icon, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// Telegram link and two-step login are required of sellers; both are set up on the account Security screen.
// A slim card: one tap opens Security.
export function SecurityCard({ user }: { user: User }) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const items = [
    { key: "tg", icon: "send", ok: !!user.telegramLinked, label: t("sl2.telegram") },
    { key: "2fa", icon: "shield", ok: user.twoFactorEnabled, label: t("sl2.twoFactor") },
  ] as const;
  const all = items.every((i) => i.ok);
  return (
    <Card onPress={() => router.push("/security")} accessibilityRole="button" accessibilityLabel={`${t("sl2.securityTitle")}: ${t(all ? "onbUx.secReady" : "onbUx.secNeed")}`} style={s.card}>
      <View style={s.head}>
        <Icon name="lock" size={18} color={all ? c.ok : c.warn} />
        <Text variant="body" weight="semibold" style={s.flex} numberOfLines={1}>{t(all ? "onbUx.secReady" : "onbUx.secNeed")}</Text>
        {all ? null : <Text variant="small" weight="bold" tone="accent">{t("onbUx.secSetup")}</Text>}
        <Icon name="chevron-right" size={18} tone="gray" />
      </View>
      <View style={s.items}>
        {items.map((i) => (
          <View key={i.key} style={[s.item, { backgroundColor: i.ok ? c.okBg : c.warnBg }]}>
            <Icon name={i.ok ? "check" : "alert-circle"} size={14} color={i.ok ? c.ok : c.warn} />
            <Text variant="caption" weight="semibold" style={{ color: i.ok ? c.ok : c.warn }} numberOfLines={1}>{i.label}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 10, paddingVertical: 14, minHeight: 44 },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  flex: { flex: 1 },
  items: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  item: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
});
