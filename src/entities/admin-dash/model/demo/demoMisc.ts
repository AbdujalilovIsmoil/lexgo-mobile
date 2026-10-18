import type { Retention } from "../retentionTypes";
import type { CallStats } from "../types";
import { dayBefore, series } from "./demoSeries";

export function demoCalls(today: string): CallStats {
  const byDay = series(today, 7, 46, 0.02);
  const total = byDay.reduce((s, p) => s + p.value, 0);
  const answered = Math.round(total * 0.87);
  return {
    total, answered, missed: total - answered, avgDurationSec: 412, byDay,
    topAgents: [{ name: "Dilnoza R.", calls: 71 }, { name: "Jasur T.", calls: 64 }, { name: "Malika S.", calls: 52 }, { name: "Bobur A.", calls: 47 }],
  };
}

export function demoRetention(today: string): Retention {
  return {
    atRisk: 23, atRiskLeads: 8, churnedThisMonth: 6, retainedPct: 78.4, previousPeriodActive: 97, currentPeriodActive: 118, retainedClients: 76,
    atRiskClients: [
      { id: "demo-c1", name: "Aziza Karimova", phone: "+998 90 *** 12 34", reasons: ["subscription_expiring"], lastPaidAt: dayBefore(today, 26) },
      { id: "demo-c2", name: "Sardor Yusupov", phone: "+998 91 *** 45 67", reasons: ["no_paid_activity_30_days"], lastPaidAt: dayBefore(today, 44) },
      { id: "demo-c3", name: "Nilufar Tosheva", phone: "+998 93 *** 89 01", reasons: ["no_paid_history"], lastPaidAt: "" },
      { id: "demo-c4", name: "Otabek Rahimov", phone: "+998 97 *** 23 45", reasons: ["subscription_expiring", "no_paid_activity_30_days"], lastPaidAt: dayBefore(today, 38) },
      { id: "demo-c5", name: "Madina Alimova", phone: "+998 94 *** 67 89", reasons: ["no_paid_history"], lastPaidAt: "" },
    ],
    upsell: [
      { id: "demo-u1", name: "Aziza Karimova", suggestion: "Biznes tarifiga o'tish", price: 490_000, status: "active" },
      { id: "demo-u2", name: "Toshkent Logistics MChJ", suggestion: "Yillik hujjat paketi", price: 2_400_000, status: "active" },
    ],
  };
}
