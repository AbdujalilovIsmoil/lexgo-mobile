import { asDict, asStr } from "@/shared/lib/json";
import type { CcClient } from "../model/types";

export function normClient(v: unknown): CcClient {
  const d = asDict(v);
  return { id: asStr(d.id), lexgoId: asStr(d.lexgo_id), name: asStr(d.name), phone: asStr(d.phone), status: asStr(d.account_status, "active") };
}
