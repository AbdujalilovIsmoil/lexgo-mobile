import type { ReactNode } from "react";
import { TabList } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";
import { LeadCard, columnTitle } from "@/entities/admin-leads";
import { LeadsHeader } from "../LeadsHeader";
import { LeadsBoard } from "./LeadsBoard";
import { ScrollTop } from "./ScrollTop";
import type { LeadsPage } from "./useLeadsPage";

// Kanban board, or (list mode) KPIs, search, stage chips and the leads of the chosen stage.
export function LeadsList({ p, bottomPad, scrollActions }: { p: LeadsPage; bottomPad?: number; scrollActions?: ReactNode }) {
  const { t } = useT();
  if (p.mode === "board") return <LeadsBoard p={p} bottomPad={bottomPad} scrollActions={scrollActions} />;
  return (
    <TabList
      bottomPad={bottomPad}
      data={p.list.shown}
      query={p.query}
      keyExtractor={(r) => r.lead.id}
      skeletonHeight={130}
      renderItem={({ lead, col }) => {
        const at = p.cols.findIndex((c) => c.key === col.key);
        return (
          <LeadCard
            lead={lead}
            stageTitle={columnTitle(t, col)}
            stageColor={col.color}
            ops={p.ops}
            meId={p.meId}
            canBack={at > 0}
            canFwd={at < p.cols.length - 1}
            busy={p.flow.busyId === lead.id}
            onOpen={() => p.setSelId(lead.id)}
            onShift={(dir) => p.flow.shift(lead, dir)}
            onStage={() => p.setMoveFor(lead)}
          />
        );
      }}
      empty={{ icon: "trending-up", title: t(p.view.filtered ? "admLeads.noMatch" : "admLeads.empty"), text: p.view.filtered ? undefined : t("admLeads.emptyText") }}
      header={p.cols.length || scrollActions ? <>{scrollActions ? <ScrollTop actions={scrollActions} bleed={16} /> : null}{p.cols.length ? <LeadsHeader stats={p.stats} filter={p.filter} onFilter={p.setFilter} stage={p.stage} onStage={p.setStage} options={p.stageOptions} filtered={p.view.filtered} matched={p.view.matched} mode={p.mode} onMode={p.setMode} /> : null}</> : null}
    />
  );
}
