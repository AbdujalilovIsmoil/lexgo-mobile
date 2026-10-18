import { http } from "@/shared/api";
import { asDict, asStr, listFrom, uzs } from "@/shared/lib/json";
import type { B2bClient, ClientDraft } from "../model/types";

function normClient(v: unknown): B2bClient {
  const d = asDict(v);
  const p = asDict(d.payload);
  return {
    id: asStr(d.id),
    name: asStr(d.name ?? d.company ?? d.title),
    industry: asStr(d.industry ?? p.industry),
    contact: asStr(d.contact ?? d.phone ?? p.contact ?? p.phone),
    stage: asStr(d.stage ?? d.status ?? d.record_type, "new"),
    value: uzs(d, "value", "deal_value", "price") || uzs(p, "value"),
  };
}

// GET /b2b/clients — a plain list (b2b.manage).
export async function listClients(): Promise<B2bClient[]> {
  return listFrom(await http("/b2b/clients"), "items", "data", "clients").map(normClient);
}

// PATCH /b2b/clients/{id} — stage, director, monthly_payment, sla …
export async function patchClient(id: string, patch: Record<string, unknown>): Promise<void> {
  await http(`/b2b/clients/${encodeURIComponent(id)}`, { method: "PATCH", body: patch });
}

// POST /b2b/clients (name, industry, contact, inn) and then PATCH the fields it does not take.
export async function createClient(d: ClientDraft): Promise<B2bClient> {
  const created = normClient(await http("/b2b/clients", { method: "POST", body: { name: d.name, industry: d.industry, contact: d.contact, inn: d.inn } }));
  const patch: Record<string, unknown> = {};
  if (d.director) patch.director = d.director;
  if (d.monthly) patch.monthly_payment = parseInt(d.monthly, 10) || 0;
  if (d.sla) patch.sla = d.sla;
  if (Object.keys(patch).length) await patchClient(created.id, patch);
  return created;
}
