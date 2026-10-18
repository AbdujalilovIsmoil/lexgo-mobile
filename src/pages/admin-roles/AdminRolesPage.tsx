import { useCallback, useMemo, useState } from "react";
import { matchRole, RoleRow, useMatrix, usePermTitles, useRoles, type Role } from "@/entities/admin-roles";
import { CreateRoleSheet } from "@/features/admin-roles";
import { AssignRoleSheet, MatrixRole, RoleDetailSheet, RolesHeader, SellerRules, type RolesTab } from "@/widgets/admin-roles";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { IconButton } from "@/shared/ui";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";

// Roles: hero numbers, search, the role list (open, create, assign to a person) and the read-only roles x permissions matrix.
export default function AdminRolesPage() {
  const { t } = useT();
  const [tab, setTab] = useState<RolesTab>("roles");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Role | null>(null);
  const [creating, setCreating] = useState(false);
  const [assign, setAssign] = useState<{ roleId: string } | null>(null);
  const roles = useRoles();
  const matrix = useMatrix();
  const titles = usePermTitles();
  const word = useDebounced(q, 250);
  const list = useMemo(() => (roles.data ?? []).filter((r) => matchRole(r, word)), [roles.data, word]);
  const mlist = useMemo(() => (matrix.data?.roles ?? []).filter((r) => matchRole(r, word)), [matrix.data, word]);
  const codes = useMemo(() => (matrix.data?.permissions ?? []).map((p) => p.code), [matrix.data]);
  const total = codes.length || titles.size;
  const onOpen = useCallback((r: Role) => setOpen(r), []);
  const onAssign = useCallback((r: Role) => { setOpen(null); setAssign({ roleId: r.id }); }, []);
  const header = <RolesHeader roles={roles.data ?? []} total={total} tab={tab} onTab={setTab} q={q} onQ={setQ}>{tab === "matrix" ? <SellerRules rules={matrix.data?.sellerRules ?? []} /> : null}</RolesHeader>;
  const off = { title: t("admRolesB.off"), text: t("admRolesB.offText") };
  const empty = { icon: "shield" as const, title: q ? t("admRolesB.noMatch") : t("admRoles.empty") };
  const right = <><IconButton icon="user-check" label={t("admRoles.assign")} onPress={() => setAssign({ roleId: "" })} /><IconButton icon="plus" label={t("admRoles.create")} onPress={() => setCreating(true)} /></>;
  return (
    <AdminPage title={t("admHub.mod.roles.title")} right={right}>
      {tab === "roles" ? (
        <PagedList data={list} query={roles} keyExtractor={(r) => r.id} renderItem={(r) => <RoleRow role={r} titles={titles} total={total} onOpen={onOpen} onAssign={onAssign} />} skeletonHeight={110} off={off} empty={empty} header={header} />
      ) : (
        <PagedList data={mlist} query={matrix} keyExtractor={(r) => r.id || r.name} renderItem={(r) => <MatrixRole role={r} all={codes} titles={titles} />} off={off} empty={empty} header={header} />
      )}
      <RoleDetailSheet role={open} onClose={() => setOpen(null)} onAssign={onAssign} />
      <CreateRoleSheet visible={creating} onClose={() => setCreating(false)} />
      <AssignRoleSheet visible={!!assign} roleId={assign?.roleId} onClose={() => setAssign(null)} />
    </AdminPage>
  );
}
