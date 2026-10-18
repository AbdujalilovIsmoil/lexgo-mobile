import { View } from "react-native";
import { useClientProfile, useMethods } from "@/entities/profile-extras";
import { Card, Icon, Text, type IconName } from "@/shared/ui";
import { fmtDate } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

function Cell({ icon, label, value, hint }: { icon: IconName; label: string; value: string; hint?: string }) {
  return (
    <Card tinted style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <Icon name={icon} size={22} tone="accent" />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="caption" tone="gray">{label}</Text>
        <Text variant="h4">{value}</Text>
        {hint ? <Text variant="caption" tone="gray2">{hint}</Text> : null}
      </View>
    </Card>
  );
}

// Current tariff, next charge date and the linked card (web: subs__top).
export function TopCards() {
  const { t, locale } = useT();
  const sub = useClientProfile().data;
  const methods = useMethods().data ?? [];
  const card = methods.find((m) => m.isDefault) ?? methods[0];
  return (
    <View style={{ gap: 10 }}>
      <Cell icon="award" label={t("cs.apTariff")} value={sub?.planName || t("cs.apNone")} hint={sub?.planName ? undefined : t("cs.apNoneHint")} />
      <Cell icon="calendar" label={t("cs.apNext")} value={sub?.renewsAt ? fmtDate(sub.renewsAt, locale) : "—"} hint={sub?.renewsAt ? undefined : t("cs.apNextHint")} />
      <Cell icon="credit-card" label={t("cs.apCard")} value={card ? `${card.brand.toUpperCase()} •••• ${card.last4}` : t("cs.apNoCard")} hint={card ? undefined : t("cs.apCardHint")} />
    </View>
  );
}
