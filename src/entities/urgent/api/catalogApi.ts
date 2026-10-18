import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr, listFrom, uzs } from "@/shared/lib/json";
import type { UrgentCatalog, UrgentService } from "../model/catalogTypes";

function normService(v: unknown): UrgentService {
  const d = asDict(v);
  return {
    key: asStr(d.key),
    title: asStr(d.title),
    delivery: asStr(d.delivery),
    price: uzs(d, "price"),
    meetingMinutes: asNum(d.meeting_minutes),
    variants: asArr(d.variants).map((x) => {
      const w = asDict(x);
      return { channel: asStr(w.channel), price: uzs(w, "price"), pricePerLawyer: uzs(w, "price_per_lawyer"), meetingMinutes: asNum(w.meeting_minutes) };
    }),
    requiresPriorPurchase: Boolean(d.requires_prior_lexgo_purchase),
    lawyerCountMin: asNum(d.lawyer_count_min, 2),
    lawyerCountMax: asNum(d.lawyer_count_max, 7),
    variant: asStr(d.variant),
    immediateCall: Boolean(d.immediate_call),
  };
}

// GET /urgent-advokat/catalog
export async function getCatalog(): Promise<UrgentCatalog> {
  const d = asDict(await http("/urgent-advokat/catalog"));
  return {
    title: asStr(d.title),
    meetingMinutes: asNum(d.meeting_default_minutes, 30),
    freeExtensionMinutes: asNum(d.free_extension_once_minutes, 3),
    paidExtensionPerMinute: uzs(d, "paid_extension_price_per_minute"),
    services: listFrom(d, "services", "items", "data").map(normService),
    groups: asArr(d.groups)
      .map((x) => ({ key: asStr(asDict(x).key), title: asStr(asDict(x).title), items: asArr(asDict(x).items).map((y) => asStr(y)).filter(Boolean) }))
      .filter((g) => g.key && g.items.length),
  };
}
