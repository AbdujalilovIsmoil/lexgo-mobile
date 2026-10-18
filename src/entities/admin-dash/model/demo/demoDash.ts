import type { AdminDash, Quality } from "../types";
import { REGION_KEYS } from "../regions";
import { dayBefore, entries, series } from "./demoSeries";

const TOTALS = {
  users: 1284, clients: 1102, yurists: 96, advokats: 74, organizations: 12, services: 48, orders: 417, cases: 163, leads: 958, payments: 389, tasks: 57, b2b_clients: 9, reviews: 212,
  gift_purchases: 41, gift_claimed: 29, gift_activation_rate: 71, gift_recipient_paid_conversion: 34, gift_average_value: 420000,
};
const PAYMENTS = { paid_amount: 186_450_000, pending_amount: 23_900_000, paid_count: 352, pending_count: 37 };
const ORDERS = { new: 38, waiting_payment: 21, paid: 44, in_progress: 96, delivered: 27, completed: 168, cancelled: 23 };
const SCORES = { hot: 214, warm: 421, cold: 323 };
const SELLERS = { yurist: 96, advokat: 74, advokat_tashkiloti: 6 };
const WEIGHTS = [38, 14, 11, 9, 8, 7, 5, 4, 2, 2]; // % share across REGION_KEYS

export function demoAdminDash(today: string): AdminDash {
  return {
    stats: { ...TOTALS, ...PAYMENTS, ...ORDERS, ...SCORES, ...SELLERS },
    charts: {
      orders_by_status: entries(ORDERS),
      leads_by_score: entries(SCORES),
      sellers_by_role: entries(SELLERS),
      leads_by_region: REGION_KEYS.map((label, i) => ({ label, value: Math.round((TOTALS.leads * WEIGHTS[i]) / 100) })),
      revenue_trend: series(today, 30, 5_200_000),
    },
    lists: {
      tasks: [{ id: "demo-t1", title: "Shartnoma loyihasini tekshirish", status: "in_progress", meta: "", date: dayBefore(today, 1) }, { id: "demo-t2", title: "Mijoz bilan qayta aloqa", status: "new", meta: "", date: today }],
      b2bClients: [{ id: "demo-b1", title: "Toshkent Logistics MChJ", status: "proposal", meta: "Logistika", amount: 18_000_000, date: dayBefore(today, 3) }, { id: "demo-b2", title: "Samarqand Textile", status: "active", meta: "Ishlab chiqarish", amount: 32_000_000, date: dayBefore(today, 9) }],
      reviews: [{ id: "demo-r1", title: "Tez va aniq javob", status: "published", meta: "5", date: dayBefore(today, 2) }],
      gifts: [{ id: "demo-g1", title: "Yuridik maslahat sovg'asi", status: "claimed", meta: "", amount: 450_000, date: dayBefore(today, 4) }],
    },
  };
}

export const demoQuality = (): Quality => ({
  avgRating: 4.7, responseSlaPct: 94, complaintRate: 14, resolvedPct: 86,
  flagged: [
    { title: "Javob muddati buzilgan", detail: "3 ta buyurtmada 15 daqiqalik javob oynasi o'tkazib yuborilgan", severity: "high" },
    { title: "Past reyting", detail: "Bir advokat oxirgi 5 baholashda 3.2 o'rtacha oldi", severity: "medium" },
    { title: "Hujjat kechikishi", detail: "Ikki hujjat so'rovi muddatidan 1 kun kech topshirildi", severity: "low" },
  ],
});
