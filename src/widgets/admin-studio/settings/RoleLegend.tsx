import { View } from "react-native";
import { SectionCard } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { STUDIO_ROLES, useStudioText } from "@/entities/admin-studio";

// What each studio role may do (editor creates, reviewer decides, publisher releases, studio admin everything).
export function RoleLegend() {
  const { t, role } = useStudioText();
  return (
    <SectionCard title={t("admStudioC.roleInfo.title")}>
      <Text variant="caption" tone="gray">{t("admStudioC.roleInfo.lead")}</Text>
      {STUDIO_ROLES.map((r) => (
        <View key={r} style={{ gap: 2 }}>
          <Text variant="small" weight="bold">{role(r)}</Text>
          <Text variant="caption" tone="gray">{t(`admStudioC.roleInfo.${r}`)}</Text>
        </View>
      ))}
      <Text variant="caption" tone="gray2">{t("admStudioC.roleInfo.admins")}</Text>
    </SectionCard>
  );
}
