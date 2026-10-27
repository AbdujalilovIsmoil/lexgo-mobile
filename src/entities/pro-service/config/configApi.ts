import { ApiError, http } from "@/shared/api";
import { normConfig } from "./normConfig";
import type { ConfigPatch, ServiceConfig } from "./types";

const url = (serviceId: string) => `/marketplace/me/services/${encodeURIComponent(serviceId)}/configuration`;

// Body exactly like the web: only the fields that were given; the price is rounded, rule ids trimmed and unique.
export function configBody(p: ConfigPatch): Record<string, boolean | number | string[]> {
  const b: Record<string, boolean | number | string[]> = {};
  if (typeof p.enabled === "boolean") b.enabled = p.enabled;
  if (typeof p.selectedPrice === "number" && Number.isFinite(p.selectedPrice)) b.selected_price = Math.round(p.selectedPrice);
  if (typeof p.negotiationAllowed === "boolean") b.negotiation_allowed = p.negotiationAllowed;
  if (Array.isArray(p.selectedRuleIds)) b.selected_rule_ids = [...new Set(p.selectedRuleIds.map((x) => x.trim()).filter(Boolean))];
  return b;
}

// The picks to send back: only rules still selectable (a removed one would be refused); unknown when the answer listed none.
export const selectedToSend = (c: ServiceConfig): string[] | undefined =>
  c.selectedRuleIds && c.selectableRules.length ? c.selectedRuleIds.filter((id) => c.selectableRules.some((r) => r.id === id)) : undefined;

// Switching on sends the whole configuration in one PATCH (TZ.md §5.3): enabled, the price, negotiation and the rule picks.
export const enableBody = (c: ServiceConfig): ConfigPatch => ({
  enabled: true,
  selectedPrice: c.selectedPrice > 0 ? c.selectedPrice : undefined,
  negotiationAllowed: c.negotiationAllowed ?? undefined,
  selectedRuleIds: selectedToSend(c),
});

// No configuration endpoint for this service (an older backend: 404 without a code, 405, 501): the status endpoint alone is used.
export const configUnsupported = (e: unknown): boolean => e instanceof ApiError && (e.status === 405 || e.status === 501 || (e.status === 404 && !e.code));

// GET /marketplace/me/services/{id}/configuration — read only through useServiceConfiguration (one reader).
export const getServiceConfig = async (serviceId: string): Promise<ServiceConfig> => normConfig(await http(url(serviceId)), serviceId);

// PATCH the same URL; the answer is the same contract, so the caller puts it straight into the cache.
export const patchServiceConfig = async (serviceId: string, p: ConfigPatch): Promise<ServiceConfig> =>
  normConfig(await http(url(serviceId), { method: "PATCH", body: configBody(p) }), serviceId);
