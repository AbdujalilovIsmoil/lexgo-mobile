import { ApiError } from "@/shared/api";
import { planGateOf, type PlanGate } from "@/entities/plan/lib/planGate";

// `gate` (a 402): which plan rule stopped it — the backend's code, the feature, used / limit and the reset — for the plan sheet.
export type Failure = { kind: "plan" | "missing" | "auth" | "busy" | "network" | "other"; message: string; gate?: PlanGate };

// One reading of a failed generate / preview call, shared by the manual and AI flows.
export function classify(e: unknown): Failure {
  if (!(e instanceof ApiError)) return { kind: "other", message: "" };
  const message = e.detail ?? "";
  const gate = planGateOf(e);
  if (gate) return { kind: "plan", message, gate };
  if (e.status === 422) return { kind: "missing", message };
  if (e.status === 401 || e.status === 403) return { kind: "auth", message };
  if (e.status === 429) return { kind: "busy", message };
  if (e.status === 0) return { kind: "network", message };
  return { kind: "other", message };
}
