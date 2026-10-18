import { useMemo, useState } from "react";
import { useCandidates, useWideCandidates, type UrgentRequest } from "@/entities/urgent";

// Where the candidate list comes from: the request's own ranking (optionally without external advocates /
// the duty desk) or a "wider search" by hand-picked directions and region.
export function useCandidateSource(req: UrgentRequest, enabled: boolean) {
  const [external, setExternal] = useState(true);
  const [callcenter, setCallcenter] = useState(true);
  const [wide, setWide] = useState(false);
  const [dirs, setDirs] = useState<string[]>(req.directions);
  const [region, setRegion] = useState(req.region);
  const [applied, setApplied] = useState(0);
  const own = useCandidates(req.id, { external, callcenter }, enabled && !wide);
  const far = useWideCandidates({ directions: dirs, region }, applied, enabled && wide);
  const query = wide ? far : own;
  const sorted = useMemo(() => [...(query.data ?? [])].sort((a, b) => b.score - a.score), [query.data]);
  return {
    query, external, setExternal, callcenter, setCallcenter, wide, setWide, dirs, setDirs, region, setRegion, apply: () => setApplied((n) => n + 1),
    matched: sorted.filter((c) => c.directionMatch), mismatched: sorted.filter((c) => !c.directionMatch),
  };
}
export type CandidateSource = ReturnType<typeof useCandidateSource>;
