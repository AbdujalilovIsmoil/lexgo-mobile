import { StyleSheet, View } from "react-native";
import Constants from "expo-constants";
import { Card, Text } from "@/shared/ui";
import { LogoutButton } from "./LogoutButton";
import { useT } from "@/shared/i18n";
import { ThemeSegment } from "@/features/theme-switch";
import { LocaleSegment } from "@/features/locale-switch";
import { useLogout } from "@/features/auth";
import { useIsAuthed } from "@/entities/session";

// App section: theme, language, (logout), version.
export function AppSettings() {
  const { t } = useT();
  const authed = useIsAuthed();
  const { confirm } = useLogout();
  const version = Constants.expoConfig?.version ?? "1.0.0";
  return (
    <View style={s.wrap}>
      <Text variant="kicker" tone="gray2" style={s.kick}>
        {t("profile.sectionApp").toUpperCase()}
      </Text>
      <Card style={s.card}>
        <Text variant="small" tone="gray">
          {t("profile.theme")}
        </Text>
        <ThemeSegment />
        <Text variant="small" tone="gray" style={s.label}>
          {t("profile.language")}
        </Text>
        <LocaleSegment />
      </Card>
      {authed ? <LogoutButton title={t("profile.logout")} onPress={confirm} /> : null}
      <Text variant="caption" tone="gray2" center style={s.version}>
        {t("profile.version", { v: version })}
      </Text>
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
