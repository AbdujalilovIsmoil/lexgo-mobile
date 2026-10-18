import { http } from "@/shared/api";
import { asArr, asDict, asStr, uzs } from "@/shared/lib/json";

export type ConfigPatch = { enabled?: boolean; selectedPrice?: number; negotiationAllowed?: boolean };

export type ServiceConfig = {
  serviceId: string;
  enabled: boolean | null;
  selectedPrice: number;
  negotiationAllowed: boolean | null;
  priceExplanation: string;
  priceExplanationLines: string[];
};

const str = (v: unknown): string => asStr(v).trim();
const bool = (v: unknown): boolean | null => (typeof v === "boolean" ? v : null);
const line = (v: unknown): string => (typeof v === "string" || typeof v === "number" ? String(v).trim() : str(asDict(v).text ?? asDict(v).label ?? asDict(v).message ?? asDict(v).title));

// Body exactly like the web: only the fields that were given; the price is rounded.
export function configBody(p: ConfigPatch): Record<string, boolean | number> {
  const b: Record<string, boolean | number> = {};
  if (typeof p.enabled === "boolean") b.enabled = p.enabled;
  if (typeof p.selectedPrice === "number" && Number.isFinite(p.selectedPrice)) b.selected_price = Math.round(p.selectedPrice);
  if (typeof p.negotiationAllowed === "boolean") b.negotiation_allowed = p.negotiationAllowed;
  return b;
}

// price_explanation is a string, a list of strings/objects, or { text|message|summary|explanation, lines|items|steps|breakdown }.
function normExplanation(v: unknown): { text: string; lines: string[] } {
  if (typeof v === "string") return { text: v.trim(), lines: [] };
  if (Array.isArray(v)) {
    const lines = v.map(line).filter(Boolean);
    return { text: lines.join(" "), lines };
  }
  const d = asDict(v);
  const src = [d.lines, d.items, d.steps, d.breakdown].find(Array.isArray);
  const lines = asArr(src).map(line).filter(Boolean);
  return { text: str(d.text ?? d.message ?? d.summary ?? d.explanation) || lines.join(" "), lines };
}

// PATCH answer: the config may sit under configuration | config | seller_service, or at the top level.
export function normConfig(raw: unknown, serviceId = ""): ServiceConfig {
  const a = asDict(raw);
  const inner = asDict(a.configuration ?? a.config ?? a.seller_service);
  const n = Object.keys(inner).length ? inner : a;
  const ex = normExplanation(a.price_explanation ?? n.price_explanation);
  return {
    serviceId: str(n.service_id ?? a.service_id) || serviceId,
    enabled: bool(n.enabled ?? n.is_enabled ?? n.is_active),
    selectedPrice: uzs(n, "selected_price", "configured_price", "price"),
    negotiationAllowed: bool(n.negotiation_allowed),
    priceExplanation: ex.text,
    priceExplanationLines: ex.lines,
  };
}

// PATCH /marketplace/me/services/{id}/configuration
export async function patchServiceConfig(serviceId: string, p: ConfigPatch): Promise<ServiceConfig> {
  return normConfig(await http(`/marketplace/me/services/${encodeURIComponent(serviceId)}/configuration`, { method: "PATCH", body: configBody(p) }), serviceId);
}
