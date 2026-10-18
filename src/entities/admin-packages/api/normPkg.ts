import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import type { Pkg, PkgComponent, PkgKind, Simulation } from "../model/types";

const KINDS: PkgKind[] = ["mandatory", "optional", "choose_one"];
const strings = (v: unknown) => asArr(v).map((x) => asStr(x)).filter(Boolean);

function component(v: unknown): PkgComponent {
  const d = asDict(v);
  const kind = asStr(d.kind) as PkgKind;
  return { serviceId: asStr(d.service_id), clientPrice: uzs(d, "client_price"), sellerFee: uzs(d, "seller_fee"), kind: KINDS.includes(kind) ? kind : "mandatory", quantity: asNum(d.quantity, 1), unit: asStr(d.unit) };
}

export function normPkg(v: unknown): Pkg {
  const d = asDict(v);
  const p = asDict(d.payload);
  return {
    id: asStr(d.id), workId: asStr(p.work_id), code: asStr(p.package_code), slug: asStr(d.slug), title: asStr(d.title), status: asStr(d.status, "draft"),
    price: uzs(d, "price"), version: asNum(p.version, 1), createdBy: asStr(d.created_by_user_id), createdAt: asStr(d.created_at), approvedAt: asStr(p.approved_at),
    components: asArr(p.components).map(component),
    milestones: asArr(p.milestones).map((m) => { const x = asDict(m); return { index: asNum(x.index), title: asStr(x.title), percent: asNum(x.percent), criteria: asStr(x.criteria) }; }),
    included: strings(p.included), excluded: strings(p.excluded), refundTerms: asStr(p.refund_terms),
    separatePrice: uzs(p, "separate_price"), savings: uzs(p, "savings"), sellerTotal: uzs(p, "seller_fee_total"), lexgoShare: uzs(p, "lexgo_share"),
    pricingModel: asStr(p.pricing_model), regionMode: asStr(p.region_mode),
  };
}

// POST /admin/service-packages/price-simulator → the numbers shown while a package is being priced.
export function normSimulation(v: unknown): Simulation {
  const d = asDict(v);
  return { price: uzs(d, "package_price"), separate: uzs(d, "separate_price"), savings: uzs(d, "savings"), seller: uzs(d, "seller_share"), lexgo: uzs(d, "lexgo_share"), discountPercent: asNum(asDict(d.quote).discount_percent) };
}
