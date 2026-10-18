import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import type { Ceo, GiftKpis } from "../model/ceoTypes";
import type { DashFilter, Point } from "../model/types";
import { dashQuery } from "./dashQuery";

function normGifts(v: unknown): GiftKpis {
  const g = asDict(v);
  return {
    giftPurchases: asNum(g.gift_purchases), giftActivationRate: asNum(g.gift_activation_rate), recipientConversion: asNum(g.recipient_conversion),
    giftToPaidConversion: asNum(g.gift_to_paid_conversion), averageGiftValue: uzs(g, "average_gift_value"), referralRate: asNum(g.referral_rate),
    giftCac: uzs(g, "gift_cac"), giftLtv: uzs(g, "gift_ltv"),
  };
}
const stage = (x: unknown): Point => { const r = asDict(x); return { label: asStr(r.stage ?? r.label ?? r.name ?? r.date), value: asNum(r.value ?? r.count) }; };
const money = (x: unknown): Point => { const r = asDict(x); return { label: asStr(r.date ?? r.label ?? r.name), value: uzs(r, "revenue", "value", "count") }; };

// GET /analytics/ceo — `cac` is either one number or { total, client, advocate }.
export async function getCeo(f?: DashFilter): Promise<Ceo> {
  const d = asDict(await http(`/analytics/ceo${dashQuery(f)}`));
  const cacObj = d.cac && typeof d.cac === "object" ? asDict(d.cac) : null;
  return {
    revenue: uzs(d, "revenue"), revenueDeltaPct: asNum(d.revenue_delta_pct), mrr: uzs(d, "mrr"),
    users: asNum(d.users ?? d.total_users), activeUsers: asNum(d.active_users), conversionPct: asNum(d.conversion_pct),
    funnel: asArr(d.funnel).map(stage),
    channels: asArr(d.channels ?? d.attribution).map((x) => {
      const r = asDict(x);
      return { name: asStr(r.source ?? r.name ?? r.channel), leads: asNum(r.leads ?? r.count), pct: asNum(r.conversion_pct ?? r.pct ?? r.share), payments: asNum(r.payments), revenue: uzs(r, "revenue") };
    }),
    revenueTrend: asArr(d.revenue_trend ?? d.trend).map(money),
    mau: asNum(d.mau), dau: asNum(d.dau), gmv: uzs(d, "gmv"), arr: uzs(d, "arr"), arpu: uzs(d, "arpu"), takeRate: asNum(d.take_rate),
    cac: cacObj ? uzs(cacObj, "total") : uzs(d, "cac"), cacClient: cacObj ? uzs(cacObj, "client") : 0, cacAdvocate: cacObj ? uzs(cacObj, "advocate") : 0,
    ltv: uzs(d, "ltv"), ltvCac: asNum(d.ltv_cac), paybackMonths: asNum(d.payback_months),
    npsClient: asNum(d.nps_client), npsAdvocate: asNum(d.nps_advocate),
    newClients: asNum(d.new_clients), newAdvocates: asNum(d.new_advocates), newLawyers: asNum(d.new_lawyers), paidPayments: asNum(d.paid_payments),
    giftKpis: normGifts(d.gift_kpis),
  };
}
