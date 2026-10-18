import type { Ceo } from "../ceoTypes";
import { series } from "./demoSeries";

export function demoCeo(today: string): Ceo {
  const trend = series(today, 30, 5_200_000);
  const revenue = trend.reduce((s, p) => s + p.value, 0);
  const share = (k: number) => Math.round(revenue * k);
  return {
    revenue, revenueDeltaPct: 12, mrr: share(0.31), users: 1284, activeUsers: 612, conversionPct: 43.5,
    funnel: [{ label: "leads", value: 958 }, { label: "orders", value: 417 }, { label: "paid", value: 352 }],
    channels: [
      { name: "web", leads: 412, pct: 38.1, payments: 157, revenue: share(0.42) },
      { name: "telegram", leads: 296, pct: 41.2, payments: 122, revenue: share(0.3) },
      { name: "referral", leads: 131, pct: 29.8, payments: 39, revenue: share(0.12) },
      { name: "ads", leads: 84, pct: 21.4, payments: 18, revenue: share(0.09) },
      { name: "organic", leads: 35, pct: 45.7, payments: 16, revenue: share(0.07) },
    ],
    revenueTrend: trend,
    mau: 612, dau: 147, gmv: share(1.6), arr: share(0.31 * 12), arpu: 145_000, takeRate: 18.5,
    cac: 46_000, cacClient: 38_000, cacAdvocate: 92_000, ltv: 1_740_000, ltvCac: 37.8, paybackMonths: 0.3,
    npsClient: 62, npsAdvocate: 48, newClients: 138, newAdvocates: 9, newLawyers: 14, paidPayments: 352,
    giftKpis: { giftPurchases: 41, giftActivationRate: 71, recipientConversion: 34, giftToPaidConversion: 27, averageGiftValue: 420_000, referralRate: 19, giftCac: 31_000, giftLtv: 980_000 },
  };
}
