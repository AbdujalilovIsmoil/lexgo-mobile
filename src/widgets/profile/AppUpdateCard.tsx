import { StyleSheet, View } from "react-native";
import Constants from "expo-constants";
import { Button, Card, Text, toast } from "@/shared/ui";
import { applyUpdate, checkForUpdate, currentUpdateId, updatesAvailable, useUpdateStore } from "@/shared/lib/appUpdate";
import { useT } from "@/shared/i18n";

// The app's version and a way to ask for an update by hand: "check", then "restart" once a newer JS bundle is downloaded. Builds without
// the update module (a development build, an old build) say so instead of offering a button that does nothing.
export function AppUpdateCard() {
  const { t } = useT();
  const status = useUpdateStore((s) => s.status);
  const version = Constants.expoConfig?.version ?? "1.0.0";
  const id = currentUpdateId();
  const on = updatesAvailable();
  const busy = status === "checking" || status === "downloading";
  const check = async () => {
    const s = await checkForUpdate();
    if (s === "latest") toast(t("upd.latest"), "ok");
    if (s === "error") toast(t("upd.error"), "err");
  };
  return (
    <Card style={s.card}>
      <Text variant="small" tone="gray">{t("upd.title")}</Text>
      <Text variant="body" weight="semibold">{t("profile.version", { v: version })}{id ? ` · ${id.slice(0, 8)}` : ""}</Text>
      {!on ? <Text variant="caption" tone="gray2">{t("upd.off")}</Text> : status === "ready" ? (
        <View style={s.col}>
          <Text variant="caption" tone="gray2">{t("upd.readyText")}</Text>
          <Button title={t("upd.restart")} icon="refresh-cw" variant="gradient" onPress={() => void applyUpdate()} style={s.btn} />
        </View>
      ) : (
        <Button title={busy ? t(status === "downloading" ? "upd.downloading" : "upd.checking") : t("upd.check")} icon="download-cloud" variant="soft" loading={busy} onPress={() => void check()} style={s.btn} />
      )}
    </Card>
  );
}

const s = StyleSheet.create({ card: { gap: 8, marginTop: 12 }, col: { gap: 8 }, btn: { alignSelf: "flex-start" } });
