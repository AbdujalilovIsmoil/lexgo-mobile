import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { AdminPage, PagedList, useDateRange } from "@/shared/ui/admin";
import { StudioGate, byOrder, useMonitoring, useStudioText } from "@/entities/admin-studio";
import { MonitorFilters, MonitorKpis, SessionRow, StudioNav } from "@/widgets/admin-studio";
import { useT } from "@/shared/i18n";

function Monitor() {
  const { t } = useT();
  const { ctorName, role } = useStudioText();
  const router = useRouter();
  const bar = useDateRange("all");
  const [code, setCode] = useState("");
  const [user, setUser] = useState("");
  const [state, setState] = useState("");
  const [q, setQ] = useState("");
  const query = useMonitoring({ code, userId: user, from: bar.range.from, to: bar.range.to });
  const rows = query.data?.items ?? [];
  const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const shown = rows
    .filter((r) => (state === "online" ? r.online : state === "offline" ? !r.online : true) && terms.every((w) => [r.userName, r.role, role(r.role), r.code, ctorName(r.code), r.objectName].join(" ").toLowerCase().includes(w)))
    .sort((x, y) => Number(y.online) - Number(x.online) || (y.lastSeenAt || "").localeCompare(x.lastSeenAt || ""));
  const codes = [...new Set([...rows.map((r) => r.code).filter(Boolean), ...(code ? [code] : [])])].sort(byOrder).map((c) => ({ value: c, label: `${c} · ${ctorName(c)}` }));
  const users = (query.data?.users ?? []).map((u) => ({ value: u.id, label: `${u.name || t("admStudioC.mon.unknown")} (${u.sessions})` }));
  return (
    <AdminPage title={t("admStudioC.mon.title")} subtitle={t("admStudioC.mon.lead")}>
      <StudioNav current="monitoring" />
      <PagedList
        skeletonHeight={110}
        data={shown}
        query={query}
        keyExtractor={(r) => r.sessionId || `${r.userId}-${r.startedAt}`}
        renderItem={(r) => <SessionRow a={r} loadedAt={query.dataUpdatedAt} onOpen={() => router.push({ pathname: "/manage/studio/object", params: { id: r.objectId } } as never)} />}
        empty={{ icon: "activity", title: t("admStudioC.mon.emptyTitle"), text: t("admStudioC.mon.emptyText") }}
        header={<View style={{ gap: 14, paddingBottom: 12 }}><MonitorKpis data={query.data} loading={query.isLoading} /><MonitorFilters codes={codes} code={code} onCode={setCode} users={users} user={user} onUser={setUser} state={state} onState={setState} q={q} onQ={setQ} bar={bar} online={rows.filter((r) => r.online).length} total={rows.length} /></View>}
      />
    </AdminPage>
  );
}

// Monitoring (admin): who edits what, for how long, with period / constructor / user filters; refreshes every 30 s.
export default function StudioMonitoringPage() {
  const { t } = useT();
  return <StudioGate need="admin" title={t("admStudioC.mon.title")}><Monitor /></StudioGate>;
}
