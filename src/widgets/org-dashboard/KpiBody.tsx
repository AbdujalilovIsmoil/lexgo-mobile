import { View } from "react-native";
import { EmptyState } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { MemberRow, WorkRow, type Dashboard, type OrgMember, type OwnerStats, type WorkItem } from "@/entities/organization";
import { CompletedList } from "./CompletedList";
import { RevenueView } from "./RevenueView";
import { itemsOf, type KpiKind } from "./kpis";

type Props = { kind: KpiKind; dash: Dashboard; stats: OwnerStats | undefined; names: Map<string, string>; onWork: (w: WorkItem) => void; onMember: (m: OrgMember) => void };

// The records behind one KPI tile.
export function KpiBody({ kind, dash, stats, names, onWork, onMember }: Props) {
  const { t } = useT();
  if (kind === "members") return <View style={{ gap: 10 }}>{dash.members.map((m) => <MemberRow key={m.userId} member={m} onPress={() => onMember(m)} />)}</View>;
  if (kind === "completed") return <CompletedList orgId={dash.org.id} names={names} onOpen={onWork} />;
  if (kind === "revenue") return stats ? <RevenueView stats={stats} names={names} onOpen={onWork} /> : null;
  const items = itemsOf(dash, kind);
  if (!items.length) return <EmptyState compact icon="inbox" title={t("og2.noWorks")} />;
  return <View style={{ gap: 10 }}>{items.map((w) => <WorkRow key={`${w.kind}-${w.id}`} item={w} memberName={names.get(w.memberUserId)} onPress={() => onWork(w)} />)}</View>;
}
