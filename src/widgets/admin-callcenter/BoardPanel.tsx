import { useState } from "react";
import { EMPTY_FILTER, filterActive, leadMatches, soft, useAssignLead, useBoard, useCcLabel, useMoveLead, useOperators, useRegionLabel, type BoardColumn, type BoardLead, type LeadFilter } from "@/entities/admin-callcenter";
import { useSession } from "@/entities/session";
import { LeadFilterSheet, LostSheet } from "@/features/admin-callcenter";
import { OptionSheet, PagedList } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { BoardHeader } from "./BoardHeader";
import { LeadTicket } from "./kit/LeadTicket";

const isLostKey = (k: string) => /lost|rejected|yoqotil|rad/i.test(k);

// Compact lead board: one list with a chip per stage, filters, "move to stage" (lost asks for a reason) and operator assignment.
export function BoardPanel({ bottomPad = 0 }: { bottomPad?: number } = {}) {
  const { t } = useT();
  const label = useCcLabel();
  const region = useRegionLabel();
  const meId = useSession()?.user.id ?? "";
  const q = useBoard();
  const ops = useOperators();
  const move = useMoveLead();
  const assign = useAssignLead();
  const [stage, setStage] = useState("");
  const [f, setF] = useState<LeadFilter>(EMPTY_FILTER);
  const [filters, setFilters] = useState(false);
  const [moveFor, setMoveFor] = useState<BoardLead | null>(null);
  const [assignFor, setAssignFor] = useState<BoardLead | null>(null);
  const [lost, setLost] = useState<{ lead: BoardLead; key: string } | null>(null);
  const cols = q.data ?? [];
  const operators = ops.data ?? [];
  const title = (c: BoardColumn) => (t(`admCc.stage.${c.key}`) !== `admCc.stage.${c.key}` ? t(`admCc.stage.${c.key}`) : c.title || label("admCc.stage", c.key));
  const match = (l: BoardLead) => leadMatches(l, f, meId);
  const rows = cols.filter((c) => !stage || c.key === stage).flatMap((c) => c.cards.filter(match).map((lead) => ({ lead, col: c })));
  const who = (id: string) => (!id ? t("admCcB.unassigned") : id === meId ? t("admCcB.me") : operators.find((o) => o.id === id)?.name || t("admCc.operator"));
  const go = (lead: BoardLead, key: string) => (isLostKey(key) ? setLost({ lead, key }) : move.mutate({ lead, key }));
  const regions = [...new Set(cols.flatMap((c) => c.cards.map((l) => l.region)).filter(Boolean))].map((r) => ({ value: r, label: region(r) }));
  const stages = cols.map((c) => ({ value: c.key, label: title(c), count: c.cards.filter(match).length }));
  return (
    <>
      <PagedList
        data={rows} query={soft(q)} keyExtractor={(r) => r.lead.id} empty={{ icon: "layers", title: t("admCcB.boardEmpty") }} skeletonHeight={100} bottomPad={bottomPad}
        header={<BoardHeader q={f.q} onQ={(v) => setF({ ...f, q: v })} active={filterActive({ ...f, q: "" })} onFilters={() => setFilters(true)} shown={rows.length} stages={stages} stage={stage} onStage={setStage} />}
        renderItem={({ lead, col }) => (
          <LeadTicket lead={lead} assignee={who(lead.assignedTo)} stage={title(col)} busy={(move.isPending && move.variables?.lead.id === lead.id) || assign.isPending} canAssign={operators.length > 0} onMove={() => setMoveFor(lead)} onAssign={() => setAssignFor(lead)} />
        )}
      />
      <OptionSheet visible={!!moveFor} onClose={() => setMoveFor(null)} title={t("admCc.moveStage")} options={cols.filter((c) => c.cards.every((l) => l.id !== moveFor?.id)).map((c) => ({ value: c.key, label: title(c) }))} onPick={(key) => moveFor && go(moveFor, key)} />
      <OptionSheet visible={!!assignFor} onClose={() => setAssignFor(null)} title={t("admCcB.assignOperator")} value={assignFor?.assignedTo || "none"} options={[{ value: "none", label: t("admCcB.unassigned") }, ...operators.map((o) => ({ value: o.id, label: o.id === meId ? `${o.name || o.phone} (${t("admCcB.me")})` : o.name || o.phone }))]} searchable onPick={(id) => assignFor && assign.mutate({ lead: assignFor, userId: id === "none" ? "" : id, byUserId: meId })} />
      <LeadFilterSheet visible={filters} onClose={() => setFilters(false)} value={f} onChange={setF} regions={regions} operators={operators} />
      <LostSheet visible={!!lost} onClose={() => setLost(null)} onConfirm={(reason, note) => { if (lost) move.mutate({ lead: lost.lead, key: lost.key, lost: { reason, note } }); setLost(null); }} />
    </>
  );
}
