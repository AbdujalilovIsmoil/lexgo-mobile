import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import type { DocAnalysis, DocQuote, PricingRule, Risk } from "../model/types";

function normRule(v: unknown): PricingRule | undefined {
  const d = asDict(v);
  const bands = asArr(d.review_fee_ranges).map((x) => ({ min: asNum(asDict(x).min_pages), max: asNum(asDict(x).max_pages), amount: asNum(asDict(x).amount) }));
  if (!bands.length) return undefined;
  return { bands, extraPageAmount: asNum(d.extra_page_amount), urgentPercent: asNum(d.urgent_percent), writtenOpinionAmount: asNum(d.written_opinion_amount) };
}

export function normQuote(v: unknown): DocQuote {
  const d = asDict(v);
  return {
    pageCount: asNum(d.page_count),
    includedPages: asNum(d.included_pages),
    extraPages: asNum(d.extra_pages),
    currency: asStr(d.currency, "UZS"),
    baseAmount: uzs(d, "base_amount"),
    ocrAmount: uzs(d, "ocr_amount"),
    lawyerReviewAmount: uzs(d, "lawyer_review_amount"),
    urgencyAmount: uzs(d, "urgency_amount"),
    writtenOpinionAmount: uzs(d, "written_opinion_amount"),
    totalAmount: uzs(d, "total_amount"),
    paymentRequired: Boolean(d.payment_required),
    aiIncluded: Boolean(d.ai_included_in_subscription),
    bandAmount: asNum(asDict(d.pricing_range).amount),
    rule: normRule(d.pricing_rule),
  };
}

const level = (v: unknown): Risk["level"] => (v === "high" || v === "medium" ? v : "low");
const ORDER = { high: 0, medium: 1, low: 2 };

export function normAnalysis(v: unknown): DocAnalysis {
  const d = asDict(v);
  const risks = asArr(d.risks).map((x) => {
    const r = asDict(x);
    return { level: level(r.level), text: asStr(r.text ?? r.risk) };
  }).filter((r) => r.text).sort((a, b) => ORDER[a.level] - ORDER[b.level]);
  const up = asDict(d.upsell_offer);
  const recommendations = asArr(d.recommendations).map((x) => asStr(x)).filter(Boolean);
  return {
    summary: asStr(d.summary),
    analysisText: asStr(d.analysis_text),
    risks,
    recommendations,
    pointsCount: asNum(d.points_count, risks.length + recommendations.length),
    pageCount: asNum(d.page_count),
    pageSource: asStr(d.page_count_source),
    fileName: asStr(d.file_name) || undefined,
    pricing: d.pricing && typeof d.pricing === "object" ? normQuote(d.pricing) : undefined,
    lawyerPricing: d.lawyer_review_pricing && typeof d.lawyer_review_pricing === "object" ? normQuote(d.lawyer_review_pricing) : undefined,
    upsell: !Object.keys(up).length || up.available === false ? undefined : { title: asStr(up.title), reason: asStr(up.reason) },
    requiresExtraPayment: Boolean(d.requires_extra_payment),
  };
}
