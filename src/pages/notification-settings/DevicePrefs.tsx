import { View } from "react-native";
import { useLocalPrefs } from "@/entities/notification";
import { useT } from "@/shared/i18n";
import { SectionCard, SwitchField } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { TestAlertButton } from "./TestAlertButton";
import { usePollingStatus } from "./usePollingStatus";

// What THIS phone does when an event arrives (not stored on the server).
export function DevicePrefs() {
  const { t } = useT();
  const p = useLocalPrefs();
  const status = usePollingStatus();
  return (
    <SectionCard title={t("nt2.deviceTitle")}>
      <View style={{ gap: 14 }}>
        <SwitchField label={t("nt2.dev.banner")} hint={t("nt2.dev.bannerHint")} value={p.banner} onChange={(banner) => p.patch({ banner })} />
        <SwitchField label={t("nt2.dev.background")} hint={t("nt2.dev.backgroundHint")} value={p.background} onChange={(background) => p.patch({ background })} />
        <SwitchField label={t("nt2.dev.sound")} value={p.sound} onChange={(sound) => p.patch({ sound })} />
        <SwitchField label={t("nt2.dev.vibrate")} value={p.vibrate} onChange={(vibrate) => p.patch({ vibrate })} />
        {status ? <Text variant="caption" tone="gray2">{t(`nt2.poll.${status}`)}</Text> : null}
        <TestAlertButton />
      </View>
    </SectionCard>
  );
}
