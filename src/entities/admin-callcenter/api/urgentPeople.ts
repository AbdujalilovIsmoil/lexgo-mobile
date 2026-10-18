import { API_BASE } from "@/shared/config/env";
import { asArr, asDict, asStr } from "@/shared/lib/json";
import type { UrgentFile, UrgentPerson, UrgentSource } from "../model/urgentTypes";

// The backend appends an id fragment to demo names ("Iqtisodiy Advokat c89cdbd3"); drop it for display.
const ID_TAIL = /\s+(?=[0-9a-f]*[0-9])(?=[0-9a-f]*[a-f])[0-9a-f]{6,}$/i;
export const cleanName = (v: string): string => v.trim().replace(ID_TAIL, "").trim() || v.trim();

const absUrl = (p: string) => (!p ? "" : /^https?:\/\//i.test(p) ? p : `${API_BASE}${p.startsWith("/") ? "" : "/"}${p}`);

export function normPerson(v: unknown): UrgentPerson | null {
  const d = asDict(v);
  const id = asStr(d.id ?? d.user_id);
  return id ? { id, name: cleanName(asStr(d.name)), phone: asStr(d.phone), role: asStr(d.role), lexgoId: asStr(d.lexgo_id) } : null;
}

export const normPeople = (v: unknown): UrgentPerson[] => asArr(v).map(normPerson).filter((x): x is UrgentPerson => x !== null);

export function normFile(v: unknown, voice: boolean): UrgentFile | null {
  if (typeof v === "string") return v ? { name: v.split("/").pop() || v, url: absUrl(v), voice } : null;
  const d = asDict(v);
  const url = asStr(d.url ?? d.file_url ?? d.download_url ?? d.path);
  const name = asStr(d.name ?? d.file_name ?? d.filename ?? d.title) || url.split("/").pop() || "";
  return url || name ? { name, url: absUrl(url), voice } : null;
}

export const normSource = (v: unknown): UrgentSource => {
  const s = asDict(v);
  return { type: asStr(s.type), id: asStr(s.id), status: asStr(s.status), title: asStr(s.title ?? s.service_title ?? s.document_type).replace(/^[_\s]+/, ""), createdAt: asStr(s.created_at) };
};
