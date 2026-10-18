import { useState } from "react";
import { BottomSheet, SheetBack, SheetScroll } from "@/shared/ui";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";
import { WorkFacts, type Dashboard, type OrgMember, type OwnerStats, type WorkItem } from "@/entities/organization";
import { KpiBody } from "./KpiBody";
import type { KpiKind } from "./kpis";

type Props = { kind: KpiKind | null; dash: Dashboard; stats: OwnerStats | undefined; names: Map<string, string>; onMember: (m: OrgMember) => void; onClose: () => void };

// Drawer behind a KPI tile: the list, and a record's details inside the same drawer (back pill returns).
export function KpiSheet({ kind: current, dash, stats, names, onMember, onClose }: Props) {
  const { t } = useT();
  const kind = useKept(current);
  const [detail, setDetail] = useState<WorkItem | null>(null);
  const close = () => {
    setDetail(null);
    onClose();
  };
  return (
    <BottomSheet visible={!!current} onClose={close} title={kind ? t(`og2.kpi.${kind}`) : ""} subtitle={detail?.workId} snaps={[0.62, 0.94]}>
      <SheetScroll>
        {detail ? <SheetBack onPress={() => setDetail(null)} /> : null}
        {detail ? <WorkFacts item={detail} memberName={names.get(detail.memberUserId)} /> : kind ? <KpiBody kind={kind} dash={dash} stats={stats} names={names} onWork={setDetail} onMember={onMember} /> : null}
      </SheetScroll>
    </BottomSheet>
  );
}
