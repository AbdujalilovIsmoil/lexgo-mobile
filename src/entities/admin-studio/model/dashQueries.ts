import { useQuery } from "@tanstack/react-query";
import { listObjects } from "../api/objectApi";
import { studioKeys } from "./queries";
import type { StudioObject, StudioStatus } from "./types";

export const COUNT_STATUSES: StudioStatus[] = ["draft", "submitted", "in_review", "approved", "published", "changes_requested"];
const LIMIT = 100;
export type DashCounts = { counts: Partial<Record<StudioStatus, number>>; perCode: Record<string, number> | null };

// Status tiles and per-constructor counts, computed from one page of each status (as on the web).
// perCode is null when some status has more than one page: the numbers would be wrong.
async function loadCounts(): Promise<DashCounts> {
  const res = await Promise.allSettled(COUNT_STATUSES.map((s) => listObjects({ status: s, limit: LIMIT })));
  if (res.every((r) => r.status === "rejected")) throw (res[0] as PromiseRejectedResult).reason;
  const counts: DashCounts["counts"] = {};
  const perCode: Record<string, number> = {};
  let exact = true;
  res.forEach((r, i) => {
    if (r.status === "rejected") return void (exact = false);
    const { items, total } = r.value;
    counts[COUNT_STATUSES[i]] = Math.max(total, items.length);
    if (items.length < total) exact = false;
    items.forEach((o) => o.code && (perCode[o.code] = (perCode[o.code] ?? 0) + 1));
  });
  return { counts, perCode: exact ? perCode : null };
}

export const useDashCounts = () => useQuery({ queryKey: [...studioKeys.all, "counts"], queryFn: loadCounts });

const at = (o: StudioObject) => Date.parse(o.updatedAt || o.createdAt) || 0;
export const useMyObjects = () =>
  useQuery({
    queryKey: [...studioKeys.all, "mine"],
    queryFn: async () => (await listObjects({ mine: true, limit: 30 })).items.filter((o) => o.status !== "archived").sort((a, b) => at(b) - at(a)).slice(0, 5),
  });
