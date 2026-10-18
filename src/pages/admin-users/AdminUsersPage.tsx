import { useState } from "react";
import { useAdminUsers, UserRow, type UserDetail, type UserHit } from "@/entities/admin-users";
import { ExportButton } from "@/features/admin-export";
import { Client360Sheet, UserEditSheet, UserFilters, UserSheet, type UserFilter } from "@/widgets/admin-users";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { useLocalPaged } from "@/shared/lib/adm/useLocalPaged";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";

const later = (fn: () => void) => setTimeout(fn, 340);

// User directory: search + role / status filters (server side), person sheet, edit, client 360, block, soft-delete, Excel export.
export default function AdminUsersPage() {
  const { t } = useT();
  const [f, setF] = useState<UserFilter>({ q: "", role: "", status: "" });
  const [open, setOpen] = useState<UserHit | null>(null);
  const [edit, setEdit] = useState<UserDetail | null>(null);
  const [c360, setC360] = useState<{ id: string; name: string } | null>(null);
  const q = f.q.trim();
  const query = useAdminUsers({ role: f.role, status: f.status, q: useDebounced(q, 300) });
  const { items, total, query: paged } = useLocalPaged(query, query.data ?? [], 25, `${f.role}|${f.status}|${q}`);
  return (
    <AdminPage title={t("admHub.mod.users.title")} subtitle={query.data ? t("ag3.count", { n: total }) : undefined} right={<ExportButton id="users" />}>
      <PagedList
        data={items} query={paged} keyExtractor={(u) => u.id} renderItem={(u) => <UserRow user={u} onPress={() => setOpen(u)} />}
        empty={{ icon: "users", title: t("ag3.empty"), text: t("ag3.emptyText") }} header={<UserFilters value={f} onChange={setF} />}
      />
      <UserSheet user={open} onClose={() => setOpen(null)} onEdit={(u) => { setOpen(null); later(() => setEdit(u)); }} on360={(u) => { setOpen(null); later(() => setC360({ id: u.id, name: u.name })); }} />
      <UserEditSheet user={edit} onClose={() => setEdit(null)} />
      <Client360Sheet target={c360} onClose={() => setC360(null)} />
    </AdminPage>
  );
}
