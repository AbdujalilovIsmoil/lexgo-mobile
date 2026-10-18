import { useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import type { TotpSetup } from "@/entities/security";
import { Button, Icon, PressableScale, Text, toast } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// Manual fallbacks of the authenticator setup (a phone cannot scan its own screen): open the
// otpauth:// link in an installed app, or read the key and type it in. The key stays hidden until
// asked for and is never copied to the clipboard (clipboard policy).
export function TotpSecret({ setup }: { setup: TotpSetup }) {
  const { t } = useT();
  const c = useColors();
  const [shown, setShown] = useState(false);
  const openApp = () => void Linking.openURL(setup.otpauthUrl).catch(() => toast(t("admSec.noAuthApp"), "info"));
  const grouped = setup.secret.replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();
  return (
    <>
      {setup.otpauthUrl ? <Button title={t("admSec.openApp")} variant="soft" icon="external-link" onPress={openApp} full /> : null}
      {setup.secret ? (
        <View style={[s.box, { backgroundColor: c.surface2 }]}>
          <View style={s.col}>
            <Text variant="caption" tone="gray">{t("admSec.secretLabel")}</Text>
            <Text variant="body" weight="bold" selectable={false} style={s.key}>{shown ? grouped : "•••• •••• •••• ••••"}</Text>
          </View>
          <PressableScale onPress={() => setShown((v) => !v)} hitSlop={10} accessibilityLabel={t(shown ? "au6.hideKey" : "au6.showKey")}>
            <Icon name={shown ? "eye-off" : "eye"} size={20} tone="accent" />
          </PressableScale>
        </View>
      ) : null}
    </>
  );
}

const s = StyleSheet.create({
  box: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: radius.r },
  col: { flex: 1, gap: 2 },
  key: { letterSpacing: 1 },
});
