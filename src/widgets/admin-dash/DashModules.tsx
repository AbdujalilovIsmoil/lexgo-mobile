import { View } from "react-native";
import { useRouter } from "expo-router";
import { moduleByKey, useAccess } from "@/entities/access";
import { useT } from "@/shared/i18n";
import { Text } from "@/shared/ui";
import { RowCard } from "@/shared/ui/admin";

const KEYS = ["pipeline", "payouts", "b2b", "retention", "callcenter"];

// Quick links to the CRM modules this user may open.
export function DashModules() {
  const { t } = useT();
  const router = useRouter();
  const access = useAccess();
  const mods = KEYS.flatMap((k) => { const m = moduleByKey(k); return m && m.visible(access) ? [m] : []; });
  if (!mods.length) return null;
  return (
    <View style={{ gap: 10 }}>
      <Text variant="h4">{t("admDashC.crm.modules")}</Text>
      {mods.map((m) => <RowCard key={m.key} icon={m.icon} tint={m.color} title={t(`admHub.mod.${m.key}.title`)} onPress={() => router.push(`/manage/${m.key}` as never)} />)}
    </View>
  );
}
