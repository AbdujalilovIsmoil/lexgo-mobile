import { http } from "@/shared/api";
import { normServices } from "./normalize";
import type { ProServices, ServiceInput, ServiceScope, ServiceStatus } from "../model/types";

const enc = encodeURIComponent;
const base = (s: ServiceScope) => (s.kind === "org" ? `/organizations/${enc(s.orgId)}/members/${enc(s.memberId)}/services` : "/lawyers/me/services");
const body = (i: ServiceInput) => ({ selected_price: Math.max(0, Math.round(i.selectedPrice || 0)), experience_note: i.note.trim().slice(0, 2000), status: i.status });

// GET …/manage?include_inactive=true — every service of the seller with its corridor and visibility.
export const listServices = async (s: ServiceScope): Promise<ProServices> => normServices(await http(`${base(s)}/manage?include_inactive=true`));

export const addService = (s: ServiceScope, i: ServiceInput) => http(`${base(s)}/manage`, { method: "POST", body: { service_id: i.serviceId, ...body(i) } });

export const updateService = (s: ServiceScope, i: ServiceInput) => http(`${base(s)}/${enc(i.serviceId)}`, { method: "PATCH", body: body(i) });

export const setServiceStatus = (s: ServiceScope, id: string, status: ServiceStatus) => http(`${base(s)}/${enc(id)}/status`, { method: "PATCH", body: { status } });

export const removeService = async (s: ServiceScope, id: string): Promise<void> => {
  await http(`${base(s)}/${enc(id)}`, { method: "DELETE" });
};
