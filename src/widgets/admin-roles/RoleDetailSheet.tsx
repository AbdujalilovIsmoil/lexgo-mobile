import { type Role, usePermissions } from "@/entities/admin-roles";
import { FactRows, FormSheet } from "@/shared/ui/admin";
import { Icon, Text } from "@/shared/ui";
import { View } from "react-native";
import { fmtDate } from "@/shared/lib/format";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";

// One role in full: code, description, created date and every permission it grants (with titles).
export function RoleDetailSheet({ role: current, onClose, onAssign }: { role: Role | null; onClose: () => void; onAssign: (r: Role) => void }) {
  const { t, locale } = useT();
  const role = useKept(current);
  const titles = new Map((usePermissions().data ?? []).map((p) => [p.code, p.title]));
  return (
    <FormSheet visible={!!current} onClose={onClose} title={role?.title || role?.name || ""} subtitle={role?.name} submitLabel={t("admRoles.assign")} onSubmit={() => role && onAssign(role)}>
      {role ? (
        <>
          <FactRows rows={[{ label: t("adm.description"), value: role.description }, { label: t("adm.created"), value: fmtDate(role.createdAt, locale) }]} />
          <Text variant="h4">{t("admRoles.permCount", { n: role.permissions.length })}</Text>
          {role.permissions.map((code) => (
            <View key={code} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Icon name="check" size={16} tone="accent" />
              <View style={{ flex: 1 }}>
                <Text variant="small" weight="semibold">{titles.get(code) ?? code}</Text>
                <Text variant="caption" tone="gray2">{code}</Text>
              </View>
            </View>
          ))}
        </>
      ) : null}
    </FormSheet>
  );
}
