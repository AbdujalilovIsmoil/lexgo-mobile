import { http } from "@/shared/api";
import { asDict, asNum, asStr, listFrom } from "@/shared/lib/json";
import type { MyMatch } from "../model/marketTypes";

// GET /matching/me — specialists the platform picked for this client (same
// reading as getMyMatches() on the web).
export async function getMyMatches(): Promise<MyMatch[]> {
  return listFrom(await http("/matching/me"), "items", "data", "matches")
    .map((x) => {
      const d = asDict(x);
      return {
        id: asStr(d.id ?? d.lawyer_user_id),
        kind: asStr(d.seller_type).toLowerCase().includes("advokat") ? ("advocate" as const) : ("lawyer" as const),
        userId: asStr(d.lawyer_user_id ?? d.user_id),
        name: asStr(d.name ?? d.lawyer_name),
        area: asStr(d.area ?? d.specialization),
        region: asStr(d.region),
        rating: asNum(d.rating, 5),
        pct: Math.min(100, Math.round(asNum(d.match_pct ?? d.score))),
        reason: asStr(d.reason),
      };
    })
    .filter((m) => (m.userId || m.id) && m.name);
}
