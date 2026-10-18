import { View } from "react-native";
import type { Role } from "@/entities/admin-roles";
import { ChipBar, SearchBox } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { RoleHero } from "./RoleHero";

export type RolesTab = "roles" | "matrix";
type Props = { roles: Role[]; total: number; tab: RolesTab; onTab: (t: RolesTab) => void; q: string; onQ: (v: string) => void; children?: React.ReactNode };

// Top of the roles screen: hero numbers, tab switch (roles / matrix), search and any extra block.
export function RolesHeader({ roles, total, tab, onTab, q, onQ, children }: Props) {
  const { t } = useT();
  const opts = [{ value: "roles" as RolesTab, label: t("admRoles.listTitle"), count: roles.length }, { value: "matrix" as RolesTab, label: t("admRoles.matrixTitle") }];
  return (
    <View style={{ gap: 12, paddingBottom: 12 }}>
      <RoleHero roles={roles} total={total} />
      <View style={{ marginHorizontal: -16, gap: 10 }}>
        <ChipBar options={opts} value={tab} onChange={onTab} />
        <SearchBox value={q} onChangeText={onQ} placeholder={t("admRolesB.searchPh")} />
      </View>
      {children}
    </View>
  );
}
