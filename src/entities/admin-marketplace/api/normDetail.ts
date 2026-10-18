import { asArr, asDict, asStr, uzs } from "@/shared/lib/json";
import { cleanTitle } from "../lib/title";
import type { MktActivity, MktConfirm } from "../model/detailTypes";
import { low } from "./norm";

export function normConfirm(v: unknown): MktConfirm {
  const d = asDict(v);
  const p = asDict(d.payload);
  return {
    id: asStr(d.id),
    status: low(d.status),
    serviceTitle: cleanTitle(asStr(p.service_title ?? d.title)),
    categoryTitle: asStr(p.category_title).trim(),
    amount: uzs(p, "amount") || uzs(d, "price"),
    deliveries: asArr(p.telegram_results)
      .map((x) => ({ chatId: asStr(asDict(x).chat_id), ok: asDict(x).ok === true, error: asStr(asDict(x).error ?? asDict(x).description).trim() }))
      .filter((x) => x.chatId),
    reviewedByChatId: asStr(p.reviewed_by_chat_id),
    reviewedAt: asStr(p.reviewed_at),
    createdAt: asStr(d.created_at),
  };
}

export function normActivity(v: unknown): MktActivity {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    action: low(d.action),
    title: asStr(d.title_uz ?? d.title).trim(),
    detail: asStr(d.detail).trim(),
    ip: asStr(d.ip).trim(),
    outcome: low(d.outcome),
    createdAt: asStr(d.created_at),
  };
}
