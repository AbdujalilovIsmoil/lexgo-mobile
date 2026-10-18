import { useState } from "react";
import { View } from "react-native";
import { useAccess } from "@/entities/access";
import { PkgRow, usePackages, type Pkg } from "@/entities/admin-packages";
import { PackageFormSheet } from "@/features/admin-packages";
import { PkgSheet } from "@/widgets/admin-packages";
import { AdminPage, ChipBar, PagedList, SearchBox } from "@/shared/ui/admin";
import { IconButton } from "@/shared/ui";
import { useLocalPaged } from "@/shared/lib/adm/useLocalPaged";
import { humanizeSlug } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

const STATUSES = ["draft", "under_review", "approved", "on_sale", "stopped"];
const later = (fn: () => void) => setTimeout(fn, 340);

// Service packages: status filter, open one for its lifecycle (submit → approve → publish → stop), preview, create / edit, clone.
export default function AdminPackagesPage() {
  const { t } = useT();
  const canCreate = useAccess().can("packages.create");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState<Pkg | null>(null);
  const [form, setForm] = useState<{ open: boolean; pkg: Pkg | null }>({ open: false, pkg: null });
  const query = usePackages();
  const all = query.data ?? [];
  const needle = q.trim().toLowerCase();
  const rows = all.filter((p) => (!status || p.status === status) && (!needle || `${p.title} ${p.code} ${p.workId}`.toLowerCase().includes(needle)));
  const { items, query: paged } = useLocalPaged(query, rows, 25, `${status}|${needle}`);
  const options = [{ value: "", label: t("adm.all"), count: all.length }, ...STATUSES.map((s) => ({ value: s, label: t(`admSt.${s}`) === `admSt.${s}` ? humanizeSlug(s) : t(`admSt.${s}`), count: all.filter((p) => p.status === s).length }))];
  return (
    <AdminPage title={t("admHub.mod.packages.title")} subtitle={t("ag5.count", { n: rows.length })} right={canCreate ? <IconButton icon="plus" onPress={() => setForm({ open: true, pkg: null })} label={t("ag5.create")} /> : undefined}>
      <PagedList
        data={items} query={paged} keyExtractor={(p) => p.id} renderItem={(p) => <PkgRow item={p} onPress={() => setOpen(p)} />}
        empty={{ icon: "package", title: t("ag5.empty"), text: t("ag5.emptyText") }}
        header={<View style={{ gap: 8, marginHorizontal: -16, marginBottom: 10 }}><SearchBox value={q} onChangeText={setQ} placeholder={t("ag5.search")} /><ChipBar options={options} value={status} onChange={setStatus} /></View>}
      />
      <PkgSheet pkg={open} onClose={() => setOpen(null)} onEdit={(p) => { setOpen(null); later(() => setForm({ open: true, pkg: p })); }} />
      <PackageFormSheet visible={form.open} pkg={form.pkg} onClose={() => setForm({ open: false, pkg: form.pkg })} />
    </AdminPage>
  );
}
