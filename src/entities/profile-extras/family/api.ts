import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import type { FamilyInput, FamilyMember } from "./types";

function norm(v: unknown): FamilyMember {
  const d = asDict(v);
  return { id: asStr(d.id), name: asStr(d.name), phone: asStr(d.phone), relation: asStr(d.relation), sharedAccess: Boolean(d.shared_access ?? d.can_use_plan), createdAt: asStr(d.created_at) };
}

const base = "/clients/me/family-members";
const body = (i: Partial<FamilyInput>) => ({ name: i.name, phone: i.phone, relation: i.relation, shared_access: i.sharedAccess });

export const listFamily = async (): Promise<FamilyMember[]> => listFrom(await http(base), "items", "data").map(norm).filter((m) => m.id);
export const addFamily = async (i: FamilyInput): Promise<FamilyMember> => norm(await http(base, { method: "POST", body: body(i) }));
export const updateFamily = async (id: string, i: Partial<FamilyInput>): Promise<FamilyMember> => norm(await http(`${base}/${encodeURIComponent(id)}`, { method: "PATCH", body: body(i) }));
export const deleteFamily = async (id: string): Promise<void> => void (await http(`${base}/${encodeURIComponent(id)}`, { method: "DELETE" }));
