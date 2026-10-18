import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import type { CallStats, DashFilter, Quality } from "../model/types";
import { dashQuery } from "./dashQuery";

// GET /quality/overview
export async function getQuality(f?: DashFilter): Promise<Quality> {
  const d = asDict(await http(`/quality/overview${dashQuery(f)}`));
  return {
    avgRating: asNum(d.avg_rating), responseSlaPct: asNum(d.response_sla_pct), complaintRate: asNum(d.complaint_rate), resolvedPct: asNum(d.resolved_pct),
    flagged: asArr(d.flagged).map((x) => { const r = asDict(x); return { title: asStr(r.title), detail: asStr(r.detail ?? r.description), severity: asStr(r.severity, "low") }; }),
  };
}

// GET /calls/analytics
export async function getCallStats(f?: DashFilter): Promise<CallStats> {
  const d = asDict(await http(`/calls/analytics${dashQuery(f)}`));
  return {
    total: asNum(d.total ?? d.total_calls), answered: asNum(d.answered ?? d.answered_calls), missed: asNum(d.missed ?? d.missed_calls),
    avgDurationSec: asNum(d.avg_duration_sec ?? d.avg_duration),
    byDay: asArr(d.by_day ?? d.daily).map((x) => { const r = asDict(x); return { label: asStr(r.label ?? r.date), value: asNum(r.value ?? r.count) }; }),
    topAgents: asArr(d.top_agents ?? d.agents).map((x) => { const r = asDict(x); return { name: asStr(r.name), calls: asNum(r.calls ?? r.count) }; }),
  };
}
