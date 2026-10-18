import { useState } from "react";
import { AppState } from "react-native";
import { showBanner } from "@/entities/notification";
import { useT } from "@/shared/i18n";
import { askPermission, showLocalAlert, usePushPermission } from "@/shared/push";
import { Button, toast } from "@/shared/ui";

const DELAY_SEC = 5;

// Schedules a local test notification in 5 s. With the app in the background the OS shows it (lock
// screen, sound); if the user stays in the app, the in-app banner shows instead. Asks for the
// permission first when it is missing.
export function TestAlertButton() {
  const { t } = useT();
  const perm = usePushPermission();
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    const ok = perm.status === "granted" || (await askPermission()) === "granted";
    const title = t("nt2.test.title");
    const body = t("nt2.test.body");
    const shown = ok && (await showLocalAlert({ id: "test-alert", title, body, category: "system", event: "", data: {}, delaySec: DELAY_SEC }));
    toast(t(shown ? "nt2.test.sent" : "nt2.test.denied"), shown ? "ok" : "err");
    if (shown) {
      setTimeout(() => {
        if (AppState.currentState === "active") showBanner({ id: `test-${Date.now()}`, ids: [], title, body, category: "system", event: "", channels: [], data: {}, entityType: "", entityId: "", deepLink: "", read: false, createdAt: new Date().toISOString() });
      }, DELAY_SEC * 1000);
    }
    setBusy(false);
  };
  return <Button title={t("nt2.test.button")} variant="soft" icon="bell" loading={busy} onPress={() => void run()} full />;
}
