import { http } from "@/shared/api";
import { normServices } from "./normalize";
import type { ProServices, ServiceInput, ServiceStatus } from "../model/types";

const enc = encodeURIComponent;
const BASE = "/lawyers/me/services";
const body = (i: ServiceInput) => ({ selected_price: Math.max(0, Math.round(i.selectedPrice || 0)), experience_note: i.note.trim().slice(0, 2000), status: i.status });

// GET …/manage?include_inactive=true — every service of the seller with its corridor and visibility.
export const listServices = async (): Promise<ProServices> => normServices(await http(`${BASE}/manage?include_inactive=true`));

export const addService = (i: ServiceInput) => http(`${BASE}/manage`, { method: "POST", body: { service_id: i.serviceId, ...body(i) } });

export const updateService = (i: ServiceInput) => http(`${BASE}/${enc(i.serviceId)}`, { method: "PATCH", body: body(i) });

export const setServiceStatus = (id: string, status: ServiceStatus) => http(`${BASE}/${enc(id)}/status`, { method: "PATCH", body: { status } });

export const removeService = async (id: string): Promise<void> => {
  await http(`${BASE}/${enc(id)}`, { method: "DELETE" });
};
