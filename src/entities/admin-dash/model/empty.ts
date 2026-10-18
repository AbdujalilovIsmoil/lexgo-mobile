import type { Ceo } from "./ceoTypes";
import type { Retention } from "./retentionTypes";
import type { AdminDash, CallStats, Quality } from "./types";

// "Empty" = the platform has no activity yet (every counter zero) — the dashboards then fall back to demo data.
export const isDashEmpty = (d: AdminDash) => Object.values(d.stats).every((v) => !v) && Object.values(d.charts).every((c) => c.every((p) => !p.value));
export const isCeoEmpty = (d: Ceo) => !d.revenue && !d.users && !d.mau && d.funnel.every((x) => !x.value) && !d.channels.length && d.revenueTrend.every((p) => !p.value);
export const isCallsEmpty = (d: CallStats) => !d.total && !d.answered && !d.missed && d.byDay.every((p) => !p.value) && !d.topAgents.length;
// avg_rating / response_sla_pct are backend constants, so only complaints and flags count.
export const isQualityEmpty = (d: Quality) => !d.complaintRate && !d.flagged.length;
export const isRetentionEmpty = (d: Retention) =>
  !d.atRisk && !d.churnedThisMonth && !d.retainedPct && !d.previousPeriodActive && !d.currentPeriodActive && !d.atRiskClients.length && !d.upsell.length;
