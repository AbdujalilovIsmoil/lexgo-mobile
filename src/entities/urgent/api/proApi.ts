import { http } from "@/shared/api";
import { listFrom } from "@/shared/lib/json";
import type { UrgentRequest } from "../model/requestTypes";
import { normUrgent } from "./norm";

// GET /urgent-advokat/requests/assigned — what an advocate / lawyer was invited to or claimed.
export async function listAssigned(f: { status?: string; kind?: string } = {}): Promise<UrgentRequest[]> {
  const qs = new URLSearchParams();
  if (f.status) qs.set("status", f.status);
  if (f.kind) qs.set("service_kind", f.kind);
  return listFrom(await http(`/urgent-advokat/requests/assigned${qs.size ? `?${qs}` : ""}`), "items", "data", "requests").map(normUrgent);
}
