import { useMemo, useState } from "react";
import { EmptyState } from "@/shared/ui";
import { QueryBoundary, SectionCard } from "@/shared/ui/admin";
import { useRouter } from "expo-router";
import { useT } from "@/shared/i18n";
import { OrgScroll, WorkSheet, useDashboard, useOwnerStats, type OrgMember, type Organization, type WorkItem } from "@/entities/organization";
import { ActiveWorks } from "./ActiveWorks";
import { DashKpis } from "./DashKpis";
import { KpiSheet } from "./KpiSheet";
import { MemberBars } from "./MemberBars";
import { MixDonut } from "./MixDonut";
import { MemberWorkSheet } from "./MemberWorkSheet";
import { OrgInfoCard } from "./OrgInfoCard";
import { OrgLinks } from "./OrgLinks";
import type { KpiKind } from "./kpis";

// Owner dashboard: KPI tiles, workload per member, active work, registration data and shortcuts.
export function OrgDashboard({ org }: { org: Organization }) {
  const { t } = useT();
  const router = useRouter();
  const q = useDashboard(org.id);
  const stats = useOwnerStats(org.id);
  const [kpi, setKpi] = useState<KpiKind | null>(null);
  const [member, setMember] = useState<OrgMember | null>(null);
  const [work, setWork] = useState<WorkItem | null>(null);
  const names = useMemo(() => new Map((q.data?.members ?? []).map((m) => [m.userId, m.name] as const)), [q.data]);
  const go = (path: string) => setTimeout(() => router.push(path as never), 340);
  const openMember = (m: OrgMember) => go(`/org/members/${encodeURIComponent(m.userId)}`);
  const d = q.data;
  return (
    <QueryBoundary query={q}>
      <OrgScroll refreshing={q.isRefetching} onRefresh={() => { void q.refetch(); void stats.refetch(); }}>
        {d ? (
          <>
            <DashKpis dash={d} stats={stats.data} loadingStats={stats.isLoading} onOpen={setKpi} />
            <SectionCard title={t("og2.workloadTitle")} action={{ label: t("og2.allMembers"), onPress: () => router.push("/org/members" as never) }}>
              {d.members.length ? <><MixDonut summary={d.summary} /><MemberBars members={d.members} onOpen={setMember} /></> : <EmptyState compact icon="users" title={t("og3.empty")} text={t("og3.emptyText")} />}
            </SectionCard>
            <ActiveWorks dash={d} names={names} onOpen={setWork} onAll={() => router.push("/org/workload" as never)} />
            <OrgInfoCard org={d.org.id ? d.org : org} nameOf={(id) => names.get(id) ?? ""} />
            <OrgLinks />
            <KpiSheet kind={kpi} dash={d} stats={stats.data} names={names} onMember={(m) => { setKpi(null); openMember(m); }} onClose={() => setKpi(null)} />
            <MemberWorkSheet member={member} dash={d} stats={stats.data} onOpen={openMember} onClose={() => setMember(null)} />
            <WorkSheet item={work} memberName={work ? names.get(work.memberUserId) : undefined} onClose={() => setWork(null)} />
          </>
        ) : null}
      </OrgScroll>
    </QueryBoundary>
  );
}
