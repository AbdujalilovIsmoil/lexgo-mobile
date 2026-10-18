import { useState } from "react";
import { View } from "react-native";
import { AidTicket, aidStatus, newestFirst, useAidList, type AidRequest } from "@/entities/admin-aid";
import { InfoButton } from "@/features/admin-moduleinfo";
import { AidHero, AidSheet } from "@/widgets/admin-aid";
import { AdminPage, PagedList, SearchBox } from "@/shared/ui/admin";
import { CcTiles } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";

// Inbox of public legal-aid requests: hero numbers, status tiles, search, call-ready tickets, detail sheet.
export default function AdminAidPage() {
  const { t } = useT();
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<AidRequest | null>(null);
  const query = useAidList();
  const all = [...(query.data ?? [])].sort(newestFirst);
  const key = (r: AidRequest) => r.status || "new";
  const statuses = [...new Set(all.map(key))];
  const tiles = [{ value: "", label: t("adm.all"), count: all.length }, ...statuses.map((s) => ({ value: s, label: aidStatus(t, s === "new" ? "" : s), count: all.filter((r) => key(r) === s).length, alert: s === "new" }))];
  const needle = q.trim().toLowerCase();
  const shown = all.filter((r) => (!status || key(r) === status) && (!needle || [r.name, r.phone, r.details, r.workId].some((x) => x.toLowerCase().includes(needle))));
  const bleed = { marginHorizontal: -16, gap: 10 } as const;
  const header = all.length ? (
    <View style={{ gap: 12, paddingBottom: 12 }}>
      <AidHero list={all} />
      <View style={bleed}><SearchBox value={q} onChangeText={setQ} placeholder={t("admAidB.search")} />{statuses.length > 1 ? <CcTiles options={tiles} value={status} onChange={setStatus} /> : null}</View>
    </View>
  ) : null;
  return (
    <AdminPage title={t("admHub.mod.legalAid.title")} subtitle={t("admAid.lead")} right={<InfoButton path="/legal-aid/info" />}>
      <PagedList
        data={shown}
        query={query}
        keyExtractor={(r) => r.id}
        renderItem={(r) => <AidTicket item={r} onPress={() => setOpen(r)} />}
        empty={all.length ? { icon: "search", title: t("admAidB.noMatch") } : { icon: "life-buoy", title: t("admAid.empty"), text: t("admAid.emptyText") }}
        off={{ title: t("admAidB.off"), text: t("admAidB.offText") }}
        skeletonHeight={104}
        header={header}
      />
      <AidSheet item={open} onClose={() => setOpen(null)} />
    </AdminPage>
  );
}
