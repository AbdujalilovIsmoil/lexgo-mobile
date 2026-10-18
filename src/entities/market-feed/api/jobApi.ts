import { http, ApiError } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import { isOpenOrder } from "@/entities/order";
import { normOrder } from "@/entities/order/api/orderApi";
import { acceptOrder } from "@/entities/order/api/actionApi";
import type { Job } from "../lib/filter";

// GET /orders — everything this seller can see; the open ones (not yet taken, not an unpaid marketplace order) are the "Ishlar bozori"
// feed, each with the time left to answer (confirmation_deadline_at).
export async function listJobs(): Promise<Job[]> {
  return listFrom(await http("/orders"), "orders", "items", "data")
    .map((v) => ({ ...normOrder(v), deadlineAt: asStr(asDict(v).confirmation_deadline_at ?? asDict(asDict(v).details).confirmation_deadline_at) }))
    .filter((j) => j.id && isOpenOrder(j))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// POST /orders/{id}/accept; 409 means another seller was faster → "taken" instead of an error.
export async function takeJob(id: string): Promise<"accepted" | "taken"> {
  try {
    await acceptOrder(id);
    return "accepted";
  } catch (e) {
    if (e instanceof ApiError && e.status === 409) return "taken";
    throw e;
  }
}
