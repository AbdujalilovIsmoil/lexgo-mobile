import { useMemo, useState } from "react";
import { ComplaintRow, useComplaints, type Complaint } from "@/entities/admin-complaints";
import { ExportButton } from "@/features/admin-export";
import { ComplaintSheet } from "@/widgets/admin-complaints";
import { AdminPage, ChipBar, PagedList, SearchBox } from "@/shared/ui/admin";
import { View } from "react-native";
import { useLocalPaged } from "@/shared/lib/adm/useLocalPaged";
import { humanizeSlug } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

// Complaints of clients about professionals and the service: filter by status, search, open the detail, export to Excel.
export default function AdminComplaintsPage() {
  const { t } = useT();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState<Complaint | null>(null);
  const query = useComplaints();
  const all = useMemo(() => query.data ?? [], [query.data]);
  const options = useMemo(() => {
    const counts = new Map<string, number>();
    all.forEach((c) => counts.set(c.status, (counts.get(c.status) ?? 0) + 1));
    return [{ value: "", label: t("adm.all"), count: all.length }, ...[...counts].map(([k, n]) => ({ value: k, label: t(`admSt.${k}`) === `admSt.${k}` ? humanizeSlug(k) : t(`admSt.${k}`), count: n }))];
  }, [all, t]);
  const needle = q.trim().toLowerCase();
  const rows = all.filter((c) => (!status || c.status === status) && (!needle || `${c.title} ${c.workId} ${c.description}`.toLowerCase().includes(needle)));
  const { items, query: paged } = useLocalPaged(query, rows, 25, `${status}|${needle}`);
  return (
    <AdminPage title={t("admHub.mod.complaints.title")} subtitle={t("ag4.count", { n: rows.length })} right={<ExportButton id="complaints" />}>
      <PagedList
        data={items} query={paged} keyExtractor={(c) => c.id} renderItem={(c) => <ComplaintRow item={c} onPress={() => setOpen(c)} />}
        empty={{ icon: "alert-triangle", title: t("ag4.empty") }}
        header={<View style={{ gap: 8, marginHorizontal: -16, marginBottom: 10 }}><SearchBox value={q} onChangeText={setQ} placeholder={t("ag4.search")} /><ChipBar options={options} value={status} onChange={setStatus} /></View>}
      />
      <ComplaintSheet item={open} onClose={() => setOpen(null)} />
    </AdminPage>
  );
}
