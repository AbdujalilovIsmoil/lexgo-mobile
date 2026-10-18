import { http } from "@/shared/api";
import { deviceLabel } from "@/entities/session/lib/deviceLabel";
import { normAccept, normRules } from "../lib/normalize";
import type { AcceptResult, RulesState } from "../model/types";

// GET /marketplace/service-rules[?service_id=] — the rules this seller has to accept (all of them when no service).
export async function listRules(serviceId?: string): Promise<RulesState> {
  const id = (serviceId ?? "").trim();
  return normRules(await http(`/marketplace/service-rules${id ? `?service_id=${encodeURIComponent(id)}` : ""}`));
}

// POST /marketplace/service-rules/{id}/accept — the acceptance is stored with this device's label.
export async function acceptRule(ruleId: string, device = deviceLabel()): Promise<AcceptResult> {
  return normAccept(await http(`/marketplace/service-rules/${encodeURIComponent(ruleId)}/accept`, { method: "POST", body: { device: device.trim() || "mobile" } }), ruleId);
}
