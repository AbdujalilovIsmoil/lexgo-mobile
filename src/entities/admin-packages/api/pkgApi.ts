import { http } from "@/shared/api";
import { asDict, listFrom } from "@/shared/lib/json";
import { toBody, type PkgDraft } from "../model/draft";
import { normPkg, normSimulation } from "./normPkg";

const enc = encodeURIComponent;
const BASE = "/admin/service-packages";
export type PkgAction = "submit" | "approve" | "publish" | "stop" | "clone";

// GET /admin/service-packages — every package of every status (a plain array).
export const listPackages = async () => listFrom(await http(BASE), "items", "data").map(normPkg).filter((p) => p.id);
export const createPackage = async (d: PkgDraft) => normPkg(await http(BASE, { method: "POST", body: toBody(d) }));
export const updatePackage = async (id: string, d: PkgDraft) => normPkg(await http(`${BASE}/${enc(id)}`, { method: "PATCH", body: toBody(d) }));

// submit (draft → under_review), approve (another staff member, → approved), publish (approved / stopped → on_sale), stop, clone (→ new draft).
export const packageAction = async (id: string, action: PkgAction) => normPkg(await http(`${BASE}/${enc(id)}/${action}`, { method: "POST", body: action === "approve" ? { note: "" } : undefined }));

// What the client and the seller will see (POST …/preview).
export const previewPackage = async (id: string) => asDict(await http(`${BASE}/${enc(id)}/preview`, { method: "POST" }));

export async function simulate(d: PkgDraft) {
  const b = toBody(d);
  return normSimulation(await http(`${BASE}/price-simulator`, { method: "POST", body: { components: b.components, price: b.price } }));
}
