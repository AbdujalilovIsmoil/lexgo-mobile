import { asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import type { MktSeller } from "../model/detailTypes";
import { low } from "./norm";

export function normSeller(v: unknown): MktSeller {
  const d = asDict(v);
  const u = asDict(d.seller);
  return {
    userId: asStr(u.id ?? d.seller_user_id ?? d.user_id),
    lexgoId: asStr(u.lexgo_id),
    name: asStr(u.name).trim() || [u.first_name, u.last_name].map((x) => asStr(x).trim()).filter(Boolean).join(" "),
    phone: asStr(u.phone).trim(),
    accountStatus: low(u.account_status),
    sellerType: low(d.seller_type ?? u.role),
    region: asStr(d.region).trim(),
    district: asStr(d.district).trim(),
    rating: asNum(d.rating),
    reviewsCount: asNum(d.reviews_count),
    isVerified: d.is_verified === true,
    verificationStatus: low(d.verification_status),
    servicesCount: asNum(d.services_count),
    ordersTotal: asNum(d.orders_total),
    activeOrders: asNum(d.active_orders),
    pendingPaymentOrders: asNum(d.pending_payment_orders),
    completedOrders: asNum(d.completed_orders),
    paidOrders: asNum(d.paid_orders),
    revenuePaid: uzs(d, "revenue_paid"),
    lastOrderAt: asStr(d.last_order_at),
  };
}
