import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import { normLawyer } from "./normalize";
import { hasPromoTarget, normPromo } from "./normPromo";
import type { AiMatch, AiResult } from "../model/marketTypes";

const strList = (v: unknown) => asArr(v).map((x) => asStr(x).trim()).filter(Boolean);

function normMatch(v: unknown): AiMatch {
  const d = asDict(v);
  const raw = asNum(d.match_score ?? d.score ?? d.relevance ?? d.confidence);
  const one = asStr(d.reason ?? d.explanation ?? d.why ?? d.match_reason).trim();
  const lawyer = asStr(d.name ?? d.lawyer_name).trim() ? normLawyer(d) : null;
  return {
    userId: asStr(d.user_id ?? d.lawyer_user_id ?? d.seller_user_id ?? d.lawyer_id ?? d.id),
    score: Math.max(0, Math.min(1, raw > 1 ? raw / 100 : raw)),
    reasons: Array.from(new Set([...strList(d.match_reasons), one].filter(Boolean))),
    lawyer: lawyer && lawyer.verified ? lawyer : null,
  };
}

// POST /marketplace/ai-search — natural language in, ranked specialists with
// reasons out. Never shows an unverified hydrated seller (web does the same).
export async function aiSearch(query: string, opts: { region?: string; kind?: string } = {}): Promise<AiResult> {
  const body: Record<string, unknown> = { query: query.trim(), limit: 20 };
  if (opts.region) body.region = opts.region;
  if (opts.kind === "advokat" || opts.kind === "yurist") body.seller_type = opts.kind;
  const d = asDict(await http("/marketplace/ai-search", { method: "POST", body }));
  const meta = asDict(d.meta);
  const seen = new Set<string>();
  const matches = asArr(d.items ?? d.matches ?? d.results ?? d.lawyers).map(normMatch).filter((m) => m.userId && !seen.has(m.userId) && (seen.add(m.userId), true));
  const promos = (v: unknown) => asArr(v).map(normPromo).filter(hasPromoTarget);
  return {
    matches,
    summary: asStr(d.summary ?? d.explanation ?? d.message),
    disclaimer: asStr(d.disclaimer).trim(),
    total: asNum(d.total, matches.length),
    sponsored: promos(meta.sponsored ?? d.sponsored),
    banners: promos(meta.banners ?? d.banners),
  };
}
