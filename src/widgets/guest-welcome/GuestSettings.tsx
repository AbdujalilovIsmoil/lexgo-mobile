import { StyleSheet, View } from "react-native";
import Constants from "expo-constants";
import { Card, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { ThemeSegment } from "@/features/theme-switch";
import { LocaleSegment } from "@/features/locale-switch";

// The app section a visitor still needs: theme, language, version (no sign-out — nobody is signed in).
export function GuestSettings() {
  const { t } = useT();
  const version = Constants.expoConfig?.version ?? "1.0.0";
  return (
    <View style={s.wrap}>
      <Text variant="kicker" tone="gray2" style={s.kick}>{t("profile.sectionApp").toUpperCase()}</Text>
      <Card style={s.card}>
        <Text variant="small" tone="gray">{t("profile.theme")}</Text>
        <ThemeSegment />
        <Text variant="small" tone="gray" style={s.label}>{t("profile.language")}</Text>
        <LocaleSegment />
      </Card>
      <Text variant="caption" tone="gray2" center style={s.version}>{t("profile.version", { v: version })}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 16, marginTop: 20 },
  kick: { marginBottom: 8, marginLeft: 4 },
  card: { gap: 8 },
  label: { marginTop: 8 },
  version: { marginTop: 16 },
});
