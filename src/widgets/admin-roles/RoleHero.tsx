import { CcHero } from "@/shared/ui/cc";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { Role } from "@/entities/admin-roles";

// Access headline: how many roles exist, how many permissions the platform has and how many roles grant nothing.
export function RoleHero({ roles, total }: { roles: Role[]; total: number }) {
  const { t } = useT();
  const c = useColors();
  const empty = roles.filter((r) => !r.permissions.length).length;
  const wide = roles.filter((r) => total && r.permissions.length / total >= 0.6).length;
  return (
    <CcHero
      stats={[{ value: String(roles.length), label: t("admRoles.listTitle") }, { value: String(total), label: t("admRoles.permissions") }, { value: String(wide), label: t("admRolesB.wide"), color: wide ? c.err : undefined }]}
      segments={[{ key: "w", value: wide, color: c.err, label: t("admRolesB.wide") }, { key: "m", value: roles.length - wide - empty, color: c.accent, label: t("admRolesB.mid") }, { key: "e", value: empty, color: c.gray2, label: t("admRolesB.none") }]}
    />
  );
}
