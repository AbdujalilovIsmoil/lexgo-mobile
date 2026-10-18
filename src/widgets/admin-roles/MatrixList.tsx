import { memo, useState } from "react";
import { View } from "react-native";
import { type Role } from "@/entities/admin-roles";
import { RowCard } from "@/shared/ui/admin";
import { Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// One role of the read-only matrix as an accordion: granted permissions first, then the ones it lacks (dimmed).
export const MatrixRole = memo(function MatrixRole({ role, all, titles }: { role: Role; all: string[]; titles: Map<string, string> }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const has = new Set(role.permissions);
  const codes = open ? [...all.filter((p) => has.has(p)), ...all.filter((p) => !has.has(p))] : [];
  return (
    <RowCard icon="shield" tint="#EF4444" title={role.title || role.name} subtitle={role.name} meta={`${role.permissions.length} / ${all.length}`} onPress={() => setOpen(!open)} right={<Icon name={open ? "chevron-up" : "chevron-down"} size={18} tone="gray" />}>
      {open ? (
        <View style={{ gap: 8 }}>
          {codes.map((p) => (
            <View key={p} style={{ flexDirection: "row", alignItems: "center", gap: 10, opacity: has.has(p) ? 1 : 0.45 }}>
              <Icon name={has.has(p) ? "check-circle" : "minus-circle"} size={16} tone={has.has(p) ? "accent" : "gray"} />
              <Text variant="small" style={{ flex: 1 }}>{titles.get(p) ?? p}</Text>
            </View>
          ))}
          {!role.permissions.length ? <Text variant="small" tone="gray">{t("admRoles.noPerms")}</Text> : null}
        </View>
      ) : null}
    </RowCard>
  );
});
