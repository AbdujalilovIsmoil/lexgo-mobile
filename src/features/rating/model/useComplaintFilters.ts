import { useMemo, useState } from "react";
import { COMPLAINT_STAGES, complaintMatches, complaintStage, useComplaintLabels, type ComplaintItem, type ComplaintKind, type ComplaintStage } from "@/entities/rating";

export type KindPick = "all" | ComplaintKind;
const SEARCH_MIN = 5;

// Same rules as the web list: the kind/status/search filters only appear when they can narrow something.
export function useComplaintFilters(items: ComplaintItem[]) {
  const L = useComplaintLabels();
  const [kind, setKind] = useState<KindPick>("all");
  const [stagePick, setStage] = useState<ComplaintStage | "">("");
  const [q, setQ] = useState("");
  const d = useMemo(() => {
    const stage = new Map<ComplaintStage, number>();
    let manual = 0;
    for (const x of items) {
      if (x.kind === "manual") manual++;
      const s = complaintStage(x.status);
      stage.set(s, (stage.get(s) ?? 0) + 1);
    }
    return { manual, quality: items.length - manual, stage, stages: COMPLAINT_STAGES.filter((s) => stage.has(s)) };
  }, [items]);
  const bothKinds = d.manual > 0 && d.quality > 0;
  const searchable = items.length >= SEARCH_MIN;
  const kindOn: KindPick = bothKinds ? kind : "all";
  const stageOn = d.stages.length > 1 && d.stages.includes(stagePick as ComplaintStage) ? stagePick : "";
  const qOn = searchable ? q.trim() : "";
  const shown = useMemo(
    () => items.filter((x) => (kindOn === "all" || x.kind === kindOn) && (!stageOn || complaintStage(x.status) === stageOn) && (!qOn || complaintMatches(x, qOn, [L.category(x.category), L.source(x.source)]))),
    [items, kindOn, stageOn, qOn, L],
  );
  const reset = () => { setKind("all"); setStage(""); setQ(""); };
  const filtered = kindOn !== "all" || !!stageOn || !!qOn;
  return { ...d, stageCount: (s: ComplaintStage) => d.stage.get(s) ?? 0, bothKinds, searchable, kind: kindOn, stage: stageOn, q, setKind, setStage, setQ, shown, reset, filtered, showBar: items.length > 1 && (bothKinds || d.stages.length > 1 || searchable) };
}
