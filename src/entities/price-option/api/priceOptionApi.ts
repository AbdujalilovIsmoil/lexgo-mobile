import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import type { AdjustmentType, OptionSection, PriceOptions, Quote } from "../model/types";

const kind = (v: unknown): AdjustmentType => (asStr(v) === "percent" ? "percent" : "fixed");

function sections(raw: unknown): OptionSection[] {
  return asArr(raw).map((v) => {
    const d = asDict(v);
    const options = asArr(d.options).map((o) => {
      const x = asDict(o);
      return { id: asStr(x.id), label: asStr(x.label), description: asStr(x.description), type: kind(x.adjustment_type), value: asNum(x.value) };
    });
    return { id: asStr(d.id), title: asStr(d.title), description: asStr(d.description), options: options.filter((o) => o.id) };
  }).filter((s) => s.options.length);
}

export function normOptions(raw: unknown): PriceOptions {
  const d = asDict(raw);
  return { targetType: asStr(d.target_type) === "package" ? "package" : "service", targetId: asStr(d.target_id), basePrice: uzs(d, "base_price"), currency: asStr(d.currency, "UZS"), sections: sections(d.sections) };
}

export function normQuote(raw: unknown): Quote {
  const q = asDict(asDict(raw).quote);
  const lines = asArr(q.breakdown).map((v) => {
    const x = asDict(v);
    return { id: asStr(x.id), label: asStr(x.label), sectionTitle: asStr(x.section_title), type: kind(x.adjustment_type), value: asNum(x.value), amount: uzs(x, "amount") };
  });
  return { basePrice: uzs(q, "base_price"), additional: uzs(q, "additional_amount"), totalPrice: uzs(q, "total_price"), currency: asStr(q.currency, "UZS"), selectedIds: asArr(q.selected_option_ids).map((x) => asStr(x)), lines };
}

const enc = encodeURIComponent;
export const getServiceOptions = async (serviceId: string) => normOptions(await http(`/marketplace/services/${enc(serviceId)}/price-options`));
export const getPackageOptions = async (packageId: string) => normOptions(await http(`/marketplace/service-packages/${enc(packageId)}/price-options`));

// POST …/quote — the total for exactly these option ids (an empty list is the base price).
export const quoteService = async (serviceId: string, lawyerId: string, ids: string[]) =>
  normQuote(await http(`/marketplace/services/${enc(serviceId)}/quote`, { method: "POST", body: { lawyer_user_id: lawyerId, selected_option_ids: ids } }));
export const quotePackage = async (packageId: string, ids: string[]) =>
  normQuote(await http(`/marketplace/service-packages/${enc(packageId)}/quote`, { method: "POST", body: { selected_option_ids: ids } }));
