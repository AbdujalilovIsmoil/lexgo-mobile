import { useQuery } from "@tanstack/react-query";
import { listObjects } from "../api/objectApi";
import { getSummary } from "../api/summaryApi";
import { studioKeys } from "./queries";
import type { StudioObject, StudioStatus } from "./types";

export const COUNT_STATUSES: StudioStatus[] = ["draft", "submitted", "in_review", "approved", "published", "changes_requested"];
export type DashCounts = { counts: Partial<Record<StudioStatus, number>>; perCode: Record<string, number> };

// Status tiles and per-constructor counts come from the server's summary (exact, archived left out of the per-constructor ones).
async function loadCounts(): Promise<DashCounts> {
  const s = await getSummary();
  const counts: DashCounts["counts"] = {};
  for (const k of COUNT_STATUSES) counts[k] = s.byStatus[k] ?? 0;
  return { counts, perCode: s.perCode };
}

export const useDashCounts = () => useQuery({ queryKey: [...studioKeys.all, "counts"], queryFn: loadCounts });
export const useSummary = () => useQuery({ queryKey: [...studioKeys.all, "summary"], queryFn: getSummary });

const at = (o: StudioObject) => Date.parse(o.updatedAt || o.createdAt) || 0;
export const useMyObjects = () =>
  useQuery({
    queryKey: [...studioKeys.all, "mine"],
    queryFn: async () => (await listObjects({ mine: true, limit: 30 })).items.filter((o) => o.status !== "archived").sort((a, b) => at(b) - at(a)).slice(0, 5),
  });
