import { View } from "react-native";
import { Button, Skeleton, Text } from "@/shared/ui";
import { SectionCard, SwitchField } from "@/shared/ui/admin";
import { openDeviceSettings } from "@/entities/auth-lock";
import { useLockSettings } from "@/features/auth-lock";
import { useT } from "@/shared/i18n";

type Props = { s: ReturnType<typeof useLockSettings> };

// On/off switch with what the device offers (Face ID / fingerprint / passcode) and why it may be unavailable.
export function LockToggleCard({ s }: Props) {
  const { t } = useT();
  const kinds = !s.info?.canLock ? t("au5.none") : s.info.biometric && s.info.kinds.length ? s.info.kinds.map((k) => t(`au5.kind.${k}`)).join(" · ") : t("au5.passcodeOnly");
  return (
    <SectionCard title={t("au5.title")}>
      <Text variant="small" tone="gray">{t("au5.desc")}</Text>
      {s.loading ? (
        <Skeleton height={44} round={12} />
      ) : (
        <View style={{ gap: 12 }}>
          <SwitchField label={t("au5.switch")} hint={kinds} value={s.enabled} onChange={(v) => void s.toggle(v)} />
          {!s.info?.canLock ? <Button title={t("au5.openSettings")} onPress={openDeviceSettings} variant="soft" full icon="settings" /> : null}
          {s.enabled ? <Button title={t("au5.test")} onPress={() => void s.test()} loading={s.busy} variant="line" full icon="unlock" /> : null}
        </View>
      )}
    </SectionCard>
  );
}
