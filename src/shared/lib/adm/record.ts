import { asDict, asStr, uzs, type Dict } from "../json";

// The backend's generic "marketplace record" (MarketplaceRecordOut): a typed row with a free-form payload.
export type MRecord = { id: string; workId: string; type: string; title: string; status: string; price: number; currency: string; ownerId: string; payload: Dict; createdAt: string; updatedAt: string };

export function normRecord(v: unknown): MRecord {
  const d = asDict(v);
  return {
    id: asStr(d.id), workId: asStr(d.work_id), type: asStr(d.record_type), title: asStr(d.title), status: asStr(d.status, "active"), price: uzs(d, "price"),
    currency: asStr(d.currency, "UZS"), ownerId: asStr(d.owner_user_id), payload: asDict(d.payload), createdAt: asStr(d.created_at), updatedAt: asStr(d.updated_at),
  };
}
