import { http } from "@/shared/api";
import { asArr, asDict, asNum } from "@/shared/lib/json";
import type { Page } from "@/shared/lib/usePaged";
import type { MktOrderDetail, MktSeller } from "../model/detailTypes";
import type { MktOrder, MktScope, MktStats } from "../model/types";
import { normOrder } from "./norm";
import { normActivity, normConfirm } from "./normDetail";
import { normSeller } from "./normSeller";
import { normStats } from "./normStats";

function qs(params: Record<string, string | number>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== "") q.set(k, String(v));
  return q.size ? `?${q}` : "";
}

const scopeParams = (s: MktScope) => ({ status: s.status, seller_user_id: s.sellerUserId, client_user_id: s.clientUserId, date_from: s.dateFrom, date_to: s.dateTo });
const pageOf = <T,>(d: Record<string, unknown>, items: T[]): Page<T> => ({ items, total: asNum(d.total, items.length) });

// GET /admin/marketplace/overview — KPI numbers for the scope.
export async function getOverview(scope: MktScope): Promise<MktStats> {
  return normStats(asDict(await http(`/admin/marketplace/overview${qs(scopeParams(scope))}`)).stats);
}

// GET /admin/marketplace/orders — paged orders for the scope.
export async function listOrders(scope: MktScope, limit: number, offset: number): Promise<Page<MktOrder>> {
  const d = asDict(await http(`/admin/marketplace/orders${qs({ ...scopeParams(scope), limit, offset })}`));
  return pageOf(d, asArr(d.items).map(normOrder).filter((o) => o.id));
}

// GET /admin/marketplace/orders/{id} — order + purchase-request confirms + activity (newest first).
export async function getOrder(id: string): Promise<MktOrderDetail> {
  const d = asDict(await http(`/admin/marketplace/orders/${encodeURIComponent(id)}`));
  return {
    order: normOrder(d.order),
    confirms: asArr(d.purchase_requests).map(normConfirm),
    activity: asArr(d.activity).map(normActivity).sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0)),
  };
}

// GET /admin/marketplace/sellers — sellers with their order counters.
export async function listSellers(o: { q: string; dateFrom: string; dateTo: string }, limit: number, offset: number): Promise<Page<MktSeller>> {
  const d = asDict(await http(`/admin/marketplace/sellers${qs({ q: o.q.trim(), date_from: o.dateFrom, date_to: o.dateTo, limit, offset })}`));
  return pageOf(d, asArr(d.items).map(normSeller).filter((s) => s.userId));
}
