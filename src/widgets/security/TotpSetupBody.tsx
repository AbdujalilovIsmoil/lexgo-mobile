import { Image, StyleSheet, View } from "react-native";
import { CodeSlots } from "@/features/auth";
import type { useTotpEnable } from "@/features/security";
import { Button, ErrorView, Skeleton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { SecretGuard } from "./SecretGuard";
import { TotpSecret } from "./TotpSecret";
import { useCodeEntry } from "./useCodeEntry";

// Authenticator setup: QR (or key / deep link), then the app's current 6-digit code. Enabled only
// after the server accepted that code. The whole screen is protected from screen capture.
export function TotpSetupBody({ flow }: { flow: ReturnType<typeof useTotpEnable> }) {
  const { t } = useT();
  const setup = flow.setup;
  const [code, setCode] = useCodeEntry(setup?.setupId ?? "");
  if (!setup) {
    return flow.busy ? <Skeleton height={220} round={18} /> : <ErrorView error={new Error("totp")} onRetry={() => void flow.start()} compact />;
  }
  return (
    <View style={s.col}>
      <SecretGuard />
      <Text variant="small" tone="gray" center>{t("admSec.totpScan")}</Text>
      {setup.qrCode ? <View style={s.qr}><Image source={{ uri: setup.qrCode }} style={s.img} resizeMode="contain" /></View> : <Text variant="small" tone="gray" center>{t("admSec.qrMissing")}</Text>}
      <TotpSecret setup={setup} />
      <Text variant="small" tone="gray">{t("admSec.totpCode")}</Text>
      <CodeSlots value={code} onChange={setCode} error={!!flow.error} onComplete={(c) => void flow.verify(c)} autoFocus={false} />
      {flow.error ? <Text variant="small" tone="err" center>{flow.error}</Text> : null}
      <Text variant="caption" tone="gray2" center>{t("au6.protected")}</Text>
      <Button title={t("auth.verify")} onPress={() => void flow.verify(code)} loading={flow.busy} disabled={code.length < 6} variant="gradient" size="lg" full icon="check" />
    </View>
  );
}

// A QR needs a light quiet zone, also in dark mode.
const s = StyleSheet.create({
  col: { gap: 14 },
  qr: { alignSelf: "center", padding: 12, borderRadius: 18, backgroundColor: "#FFFFFF" },
  img: { width: 196, height: 196 },
});
