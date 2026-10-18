import { useState } from "react";
import { OptionSheet, PagedList } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { STAGES, stageLabel, useClients, useSetStage, type B2bClient } from "@/entities/admin-b2b";
import { B2bHeader, B2bTicket, ClientFormSheet, DocumentSheet, type DocTarget } from "@/widgets/admin-b2b";

// Clients: funnel hero, search and stage tiles on top, one ticket per client (stage, deal value, PDFs, history), add-client sheet.
export function ClientsTab({ adding, onAdded, onTimeline }: { adding: boolean; onAdded: () => void; onTimeline: (c: B2bClient) => void }) {
  const { t } = useT();
  const q = useClients();
  const setStage = useSetStage();
  const [search, setSearch] = useState("");
  const [stage, setStageFilter] = useState("");
  const [doc, setDoc] = useState<DocTarget | null>(null);
  const [pick, setPick] = useState<B2bClient | null>(null);
  const all = q.data ?? [];
  const needle = search.trim().toLowerCase();
  const rows = all.filter((c) => (!stage || c.stage === stage) && (!needle || `${c.name} ${c.industry} ${c.contact}`.toLowerCase().includes(needle)));
  const stages = pick && !STAGES.includes(pick.stage) ? [pick.stage, ...STAGES] : STAGES;
  return (
    <>
      <PagedList
        data={rows}
        query={q}
        keyExtractor={(c) => c.id}
        skeletonHeight={110}
        renderItem={(c) => <B2bTicket client={c} onStage={() => setPick(c)} onDoc={(kind) => setDoc({ kind, client: c })} onTimeline={() => onTimeline(c)} />}
        empty={{ icon: "briefcase", title: t(all.length ? "admB2b.noMatch" : "admB2b.empty"), text: all.length ? undefined : t("admB2b.emptyText") }}
        header={all.length ? <B2bHeader clients={all} search={search} onSearch={setSearch} stage={stage} onStage={setStageFilter} /> : null}
      />
      <ClientFormSheet visible={adding} onClose={onAdded} />
      <DocumentSheet target={doc} onClose={() => setDoc(null)} />
      <OptionSheet visible={!!pick} onClose={() => setPick(null)} title={t("admB2b.stageLabel")} options={stages.map((s) => ({ value: s, label: stageLabel(t, s) }))} value={pick?.stage} onPick={(s) => pick && s !== pick.stage && setStage.mutate({ id: pick.id, stage: s })} />
    </>
  );
}
