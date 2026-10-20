import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Button, confirmDialog, toast } from "@/shared/ui";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { ConstructorRow, StudioGate, dashRows, exportAll, studioKeys, syncConstructors, useDashCounts, useMyObjects, useRegistry, useStudioAccess, useStudioErrorText, useStudioText } from "@/entities/admin-studio";
import { DashFilters, DashMine, EntityCards, StudioHero, StudioOverview, DashNav, GroupHeader, StudioNav } from "@/widgets/admin-studio";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { useT } from "@/shared/i18n";

function Dash() {
  const { t } = useT();
  const { ctorName } = useStudioText();
  const errText = useStudioErrorText();
  const a = useStudioAccess();
  const router = useRouter();
  const reg = useRegistry();
  const counts = useDashCounts();
  const mine = useMyObjects();
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("");
  const [exporting, setExporting] = useState(false);
  const sync = useAdminMutation({ mutationFn: syncConstructors, invalidate: [studioKeys.all], success: "admStudio.dash.synced" });
  const groups = reg.data?.groups ?? [];
  const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const rows = dashRows(groups, (c) => terms.every((w) => [c.code, c.title, c.runtime, ctorName(c.code, c.title)].join(" ").toLowerCase().includes(w)), group);
  const tiles = groups.map((g) => ({ value: g.key, count: g.items.length, title: g.title }));
  const query = { ...reg, isRefetching: reg.isRefetching, refetch: () => Promise.all([reg.refetch(), counts.refetch(), mine.refetch()]) };
  const askSync = () => confirmDialog({ title: t("admStudio.dash.syncTitle"), message: t("admStudio.dash.syncText"), confirmLabel: t("admStudio.dash.syncConfirm"), cancelLabel: t("adm.cancel"), icon: "refresh-cw", onConfirm: async () => void (await sync.mutateAsync()) });
  const doExport = () => (setExporting(true), exportAll().catch((e) => toast(errText(e), "err")).finally(() => setExporting(false)));
  return (
    <AdminPage title={t("admHub.mod.studio.title")}>
      <StudioNav current="home" />
      <PagedList
        data={rows}
        query={query}
        keyExtractor={(r) => (r.type === "group" ? `g:${r.group.key}` : r.item.code)}
        renderItem={(r) => r.type === "group" ? <GroupHeader group={r.group} /> : <ConstructorRow item={r.item} count={counts.data?.perCode ? counts.data.perCode[r.item.code] ?? 0 : null} onPress={() => router.push({ pathname: "/manage/studio/objects", params: { code: r.item.code } } as never)} />}
        empty={{ icon: "layers", title: t("admStudio.dash.emptyTitle"), text: t(a.isAdmin ? "admStudio.dash.emptyAdmin" : "admStudio.dash.emptyText") }}
        header={
          <View style={{ gap: 14, paddingBottom: 12 }}>
            <StudioOverview />
            <StudioHero onExport={doExport} exporting={exporting} />
            <DashNav />
            <EntityCards />
            <DashMine />
            {a.isAdmin ? <Button title={t("admStudio.dash.sync")} icon="refresh-cw" variant="soft" size="sm" loading={sync.isPending} onPress={askSync} /> : null}
            <DashFilters q={q} onQ={setQ} groups={tiles} group={group} onGroup={setGroup} total={rows.filter((r) => r.type === "ctor").length} />
          </View>
        }
      />
    </AdminPage>
  );
}

// Studio home: status tiles, my work, the constructor catalogue (with per-constructor counts) and admin tools.
export default function AdminStudioPage() {
  const { t } = useT();
  return <StudioGate need="any" title={t("admHub.mod.studio.title")}><Dash /></StudioGate>;
}
