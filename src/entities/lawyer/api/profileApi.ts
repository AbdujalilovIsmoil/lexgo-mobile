import { http, ApiError } from "@/shared/api";
import { listFrom } from "@/shared/lib/json";
import { normLawyer } from "./normalize";
import { normService } from "./normService";
import type { Lawyer, LawyerService } from "../model/types";

// Specialists the matcher picks (/matching/me) are not always in the marketplace feed, so a 404 from
// GET /marketplace/lawyers/{user_id} falls back to the public list, like the web's getLawyerById().
async function findInList(id: string): Promise<Lawyer | null> {
  const rows = listFrom(await http("/lawyers"), "lawyers", "items", "data").map(normLawyer);
  return rows.find((l) => l.userId === id || l.id === id) ?? null;
}

// null when the profile is gone everywhere.
export async function getLawyer(id: string): Promise<Lawyer | null> {
  if (!id) return null;
  try {
    const l = normLawyer(await http(`/marketplace/lawyers/${encodeURIComponent(id)}`));
    return l.userId ? l : null;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return findInList(id);
    throw e;
  }
}

// GET /marketplace/lawyers/{user_id}/services — the services he sells right now (none when he is not in the feed).
export async function getLawyerServices(id: string): Promise<LawyerService[]> {
  try {
    const data = await http(`/marketplace/lawyers/${encodeURIComponent(id)}/services`);
    return listFrom(data, "items", "data").map(normService).filter((s) => s.id);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return [];
    throw e;
  }
}

