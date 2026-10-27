import type { QueryClient } from "@tanstack/react-query";
import { rulesBlockOf } from "@/entities/service-rules/lib/normalize";
import type { ServiceRule } from "@/entities/service-rules/model/types";
import { addService, setServiceStatus, updateService } from "../api/serviceApi";
import type { ServiceInput, ServiceStatus } from "../model/types";
import { configUnsupported, enableBody, patchServiceConfig } from "./configApi";
import { configKeys, configQuery } from "./queries";
import type { ServiceConfig } from "./types";

// The rules stopped it: the ids still to accept and the rules the configuration listed (the sheet's fallback texts).
export type Blocked = { missing: string[]; rules: ServiceRule[] };
export type Switched = { blocked: Blocked | null; warn: boolean };

const blockedBy = (c: ServiceConfig): Blocked => ({ missing: c.missingRuleIds, rules: c.requiredRules });

// PATCH the configuration and keep the answer (TZ.md "Pricing Growth": the PATCH returns the same contract).
async function patchKept(qc: QueryClient, id: string, p: Parameters<typeof patchServiceConfig>[1]): Promise<ServiceConfig> {
  const next = await patchServiceConfig(id, p);
  qc.setQueryData(configKeys.one(id), next);
  return next;
}

// Switch on (TZ.md §5.3): the configuration is read again first; while it misses rules nothing is sent. Otherwise one PATCH
// carries the whole configuration with enabled=true. When its answer does not say "active" the listing status follows (web
// parity) — and if that fails, the configuration is switched back off so the service stays off. A service without a
// configuration endpoint uses the status endpoint alone. A 409 service_rules_acceptance_required is thrown to the caller.
export async function turnOn(qc: QueryClient, id: string): Promise<Switched> {
  const cfg = await qc.fetchQuery({ ...configQuery(id), staleTime: 0 }).catch((e: unknown) => {
    if (configUnsupported(e)) return null;
    throw e;
  });
  if (!cfg) {
    await setServiceStatus(id, "active");
    return { blocked: null, warn: false };
  }
  if (cfg.rulesPending) return { blocked: blockedBy(cfg), warn: false };
  const next = await patchKept(qc, id, enableBody(cfg));
  if (next.rulesPending) return { blocked: blockedBy(next), warn: false };
  if (next.status !== "active") {
    await setServiceStatus(id, "active").catch(async (e: unknown) => {
      await patchKept(qc, id, { enabled: false }).catch(() => undefined);
      throw e;
    });
  }
  return { blocked: null, warn: false };
}

// Pause / switch off (web order): the listing status first, then the configuration is switched off too; a failed configuration
// call only warns.
export async function turnOff(qc: QueryClient, id: string, status: Exclude<ServiceStatus, "active">): Promise<Switched> {
  await setServiceStatus(id, status);
  try {
    await patchKept(qc, id, { enabled: false });
    return { blocked: null, warn: false };
  } catch (e) {
    return { blocked: null, warn: !configUnsupported(e) };
  }
}

// Add / edit: the service row first, then the whole configuration in one PATCH (enabled = the chosen status). When the rules
// still refuse switching it on, a service that was not on before goes back on pause and the missing rules are returned: the
// service is saved, but off.
export async function saveService(input: ServiceInput, create: boolean, wasActive: boolean): Promise<Switched> {
  await (create ? addService(input) : updateService(input));
  const on = input.status === "active";
  let blocked: Blocked;
  try {
    const cfg = await patchServiceConfig(input.serviceId, {
      enabled: on,
      selectedPrice: input.selectedPrice > 0 ? input.selectedPrice : undefined,
      negotiationAllowed: input.negotiationAllowed ?? undefined,
      selectedRuleIds: input.selectedRuleIds ?? undefined,
    });
    if (!on || !cfg.rulesPending) return { blocked: null, warn: false };
    blocked = blockedBy(cfg);
  } catch (e) {
    const named = rulesBlockOf(e);
    if (!named || !on) return { blocked: null, warn: !configUnsupported(e) };
    blocked = { missing: named, rules: [] };
  }
  if (!wasActive) await setServiceStatus(input.serviceId, "paused").catch(() => undefined);
  return { blocked, warn: false };
}
