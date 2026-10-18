import { http } from "@/shared/api";
import { asArr, asDict, asStr } from "@/shared/lib/json";
import { windowOpen } from "../lib/window";
import { getRateTarget } from "./targetApi";
import type { RateTarget } from "../model/types";

const TYPES = new Set(["document_lawyer_work", "urgent_advokat"]);
const FINISHED = new Set(["completed", "file_ready", "fulfilled", "done", "delivered", "result_ready", "ready"]);

// A work whose window ended or was used never reopens: it is not read again by the next scans.
const settled = new Set<string>();
const isSettled = (t: RateTarget): boolean => t.window.submitted || t.window.closedReason === "expired" || t.window.closedReason === "submitted";

// Works the client could still rate right now. The list says which works look finished; only the
// detail's rating window (the backend's answer) says one is actually open.
export async function scanOpenWindows(): Promise<RateTarget[]> {
  const d = asDict(await http("/clients/me/works?limit=12"));
  const refs = asArr(d.items).map((x) => asDict(x)).filter((w) => TYPES.has(asStr(w.type)) && FINISHED.has(asStr(w.status))).map((w) => asStr(w.work_id)).filter((id) => id && !settled.has(id)).slice(0, 4);
  const all = await Promise.allSettled(refs.map(getRateTarget));
  return all.flatMap((r, i) => {
    if (r.status !== "fulfilled") return [];
    if (isSettled(r.value)) settled.add(refs[i]);
    return windowOpen(r.value.window) && r.value.window.remainingSeconds > 0 ? [r.value] : [];
  });
}
