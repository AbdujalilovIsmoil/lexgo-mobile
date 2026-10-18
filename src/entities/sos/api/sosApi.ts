import { http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import type { SosRequest } from "../model/types";

function normSos(v: unknown): SosRequest {
  const d = asDict(v);
  const duty = asDict(d.duty_lawyer ?? d.assigned_to);
  return {
    id: asStr(d.id),
    status: asStr(d.status, "pending"),
    category: asStr(d.category),
    dutyName: asStr(duty.name) || asStr(d.duty_name) || undefined,
    roomId: asStr(d.chat_room_id ?? d.room_id) || undefined,
    createdAt: asStr(d.created_at ?? d.createdAt),
  };
}

// POST /sos { category, description } — same body as createSosRequest() on the web.
export async function createSosRequest(input: { category: string; description: string }): Promise<SosRequest> {
  return normSos(await http("/sos", { method: "POST", body: input }));
}
