import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { HOTLINE } from "@/shared/config/contact";
import { openTel } from "@/shared/lib/links";
import { useColors } from "@/shared/theme";
import { Button, Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Level 3: an urgent matter puts the call center and SOS before everything else.
export function UrgentBlock() {
  const c = useColors();
  const { t } = useT();
  const router = useRouter();
  return (
    <View style={[s.box, { backgroundColor: c.errBg, borderColor: c.err }]} accessibilityRole="alert">
      <View style={s.head}>
        <Icon name="alert-triangle" size={22} color={c.err} />
        <View style={s.flex}>
          <Text variant="body" weight="bold">{t("cxIn.urgentTitle")}</Text>
          <Text variant="small" tone="gray">{t("cxIn.urgentText")}</Text>
        </View>
      </View>
      <Button title={t("cxIn.urgentCta")} icon="alert-triangle" full onPress={() => router.push("/sos")} style={s.red} />
      <Button title={HOTLINE} icon="phone" variant="line" full onPress={() => openTel(HOTLINE)} />
    </View>
  );
}

const s = StyleSheet.create({
  box: { gap: 10, padding: 14, borderRadius: 20, borderWidth: 1.5 },
  head: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  flex: { flex: 1, gap: 2 },
  red: { backgroundColor: "#E11D48" },
});
