import { useState } from "react";
import { View } from "react-native";
import { useEntitlements } from "@/entities/plan";
import { useClientProfile } from "@/entities/profile-extras";
import { useAutoRenew } from "@/features/choose-plan";
import { MethodSheet } from "@/features/profile-extras";
import { SwitchField } from "@/shared/ui/admin";
import { Button, Card, Icon, Skeleton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// ATMOS auto-pay (web .apay): the switch is PATCH /subscriptions/{id}/auto-renew, or a device-only
// choice while there is no subscription; "bind card" opens the card sheet (saved as the default card).
export function AutopayPanel() {
  const { t } = useT();
  const ent = useEntitlements();
  const sub = ent.data?.subs[0];
  const auto = useAutoRenew(sub?.id ?? "");
  const profile = useClientProfile().data;
  const [bind, setBind] = useState(false);
  const server = !!sub && (auto.known || typeof profile?.autoRenew === "boolean");
  const on = auto.known ? auto.value : profile?.autoRenew ?? auto.value;
  if (ent.isPending) return <Card><Skeleton height={64} round={16} /></Card>;
  return (
    <Card style={{ gap: 12 }}>
      <Text variant="h4">{t("cs.apTitle")}</Text>
      <SwitchField label={`${t("cs.apToggle")} · ${on ? t("cs.apOn") : t("cs.apOff")}`} hint={server ? undefined : t("tgp.localNote")} value={on} onChange={(on) => !auto.pending && auto.set(on)} />
      <View><Button title={t("cs.apBind")} icon="credit-card" variant="soft" size="sm" onPress={() => setBind(true)} /></View>
      {server ? null : (
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Icon name="info" size={16} tone="gray" />
          <Text variant="caption" tone="gray" style={{ flex: 1 }}>{t("tgp.pendingNote")}</Text>
        </View>
      )}
      <MethodSheet visible={bind} onClose={() => setBind(false)} title={t("tgp.bindTitle")} note={t("tgp.bindNote")} forceDefault />
    </Card>
  );
}
