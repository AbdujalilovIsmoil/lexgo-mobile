import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSession } from "@/entities/session";
import { Button, Chip, GradientBox, Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { radius, useColors } from "@/shared/theme";
import { closeInstructor, sendToInstructor } from "@/features/instructor";

// First screen of the sheet: what the assistant does (and does not), suggested questions, a way to the legal AI.
export function Welcome() {
  const { t, tList, locale } = useT();
  const c = useColors();
  const user = useSession()?.user;
  const key = !user ? "ax2.suggest" : user.roles.length ? "ax2.suggestStaff" : user.role === "client" ? "ax2.suggest" : "ax2.suggestPro";
  return (
    <View style={s.wrap}>
      <GradientBox round={30} style={s.icon}>
        <Icon name="compass" size={28} tone="white" />
      </GradientBox>
      <Text variant="h3" center>{t("ax2.welcomeTitle")}</Text>
      <Text variant="small" tone="gray" center>{t("ax2.welcomeText")}</Text>
      <View style={s.chips}>
        {tList(key).map((q) => <Chip key={q} label={q} onPress={() => void sendToInstructor(q, locale)} />)}
      </View>
      <View style={[s.legal, { backgroundColor: c.tint, borderColor: c.line }]}>
        <Text variant="caption" tone="gray" center>{t("ax2.legalNote")}</Text>
        <Button title={t("ax2.toLegal")} icon="zap" variant="gradient" size="sm" style={s.center} onPress={() => { closeInstructor(); router.navigate("/ai"); }} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: "center", gap: 12, paddingVertical: 8 },
  icon: { width: 60, height: 60, alignItems: "center", justifyContent: "center" },
  legal: { alignSelf: "stretch", alignItems: "center", gap: 10, padding: 14, marginTop: 8, borderRadius: radius.rl, borderWidth: 1 },
  center: { alignSelf: "center" }, // Button is flex-start on its own; the note above it is centred
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 4 },
});
