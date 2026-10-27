import { ApiError } from "@/shared/api/errors";
import { asDict, asStr } from "@/shared/lib/json";

// The inputs of the form a server error can point at.
export type AchSlot = "type" | "title" | "category" | "date" | "description" | "evidence";
export type AchServerError = { code: string; slots: AchSlot[]; message: string };

const BY_FIELD: Record<string, AchSlot> = { achievement_type: "type", title: "title", category_id: "category", achieved_at: "date", description: "description", evidence_ids: "evidence" };

// A 422 names inputs by `loc` (FastAPI), or an error code carries `field`; the server's own sentence is kept for the first input.
// null = not about the form (offline, 5xx …), which the sheet shows on top.
export function achievementErrorOf(e: unknown): AchServerError | null {
  if (!(e instanceof ApiError)) return null;
  const d = asDict(e.data.detail);
  const named = [asStr(d.field), ...Object.keys(e.fieldErrors)].map((f) => BY_FIELD[f]).filter((s): s is AchSlot => !!s);
  const slots = [...new Set(named)];
  if (!slots.length) return null;
  const first = Object.entries(e.fieldErrors).find(([k]) => BY_FIELD[k] === slots[0])?.[1] ?? "";
  return { code: asStr(d.code) || e.code || "", slots, message: first };
}
