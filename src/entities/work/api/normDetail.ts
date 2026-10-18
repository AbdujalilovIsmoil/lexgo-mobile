import { asDict } from "@/shared/lib/json";
import type { WorkDetail } from "../model/detailTypes";
import { normDoc } from "./normDoc";
import { normCase, normComplaintWork, normUnknown } from "./normOther";
import { normOrder } from "./normOrder";
import { normUrgent } from "./normUrgent";
import { normWork } from "./normWork";

// GET /clients/me/works/{work_id}: `summary` plus a block set that depends on the type.
export function normDetail(raw: unknown): WorkDetail {
  const d = asDict(raw);
  const work = normWork(d.summary);
  const part =
    work.kind === "document" ? normDoc(work, d)
    : work.kind === "urgent" ? normUrgent(work, d)
    : work.kind === "order" ? normOrder(work, d)
    : work.kind === "case" ? normCase(work, d)
    : work.kind === "complaint" ? normComplaintWork(work, d)
    : normUnknown(work);
  return { work, ...part };
}
