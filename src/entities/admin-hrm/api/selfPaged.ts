import { asDict, asNum, listFrom } from "@/shared/lib/json";
import { hrmGet } from "./core";
import { normApproval, normMessage, normTask } from "./normWork";
import { normDay } from "./normOps";

export const SELF_PAGE = 25;
export type SelfPage<T> = { items: T[]; next: number | null };

// One server page (limit/offset like the web) of a /internal/me/* list; `next` is the next offset or null at the end.
async function page<T>(path: string, p: Record<string, string | number | boolean | undefined>, offset: number, map: (v: unknown) => T, size = SELF_PAGE): Promise<SelfPage<T>> {
  const raw = await hrmGet(path, { ...p, limit: size, offset });
  const d = asDict(raw);
  const items = listFrom(raw, "items", "data").map(map);
  const more = typeof d.has_more === "boolean" ? d.has_more : Array.isArray(raw) ? items.length === size : offset + items.length < asNum(d.total, 0);
  return { items, next: more && items.length ? offset + items.length : null };
}

export const pageMyTasks = (q: string, status: string, offset: number, size?: number) => page("/me/tasks", { q, status }, offset, normTask, size);
export const pageMyMessages = (unread: boolean, offset: number, size?: number) => page("/me/messages", { unread: unread || undefined }, offset, normMessage, size);
export const pageMyApprovals = (status: string, offset: number) => page("/me/approvals", { status }, offset, normApproval);
export const pageMyAttendance = (from: string, to: string, offset: number) => page("/me/attendance", { date_from: from, date_to: to }, offset, normDay);
