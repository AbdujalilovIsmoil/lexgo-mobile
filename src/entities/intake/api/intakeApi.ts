import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr, listFrom } from "@/shared/lib/json";
import type { Classification, IntakeOffer, LegalSource } from "../model/types";

const source = (v: unknown): LegalSource => {
  const d = asDict(v);
  return { key: asStr(d.key), title: asStr(d.title ?? d.name), url: asStr(d.url), trustLevel: asStr(d.trust_level) };
};
const sources = (v: unknown) => asArr(v).map(source).filter((x) => x.title);

function offer(v: unknown): IntakeOffer {
  const o = asDict(v);
  const p = asDict(o.passport);
  const price = Number(o.base_price ?? p.standard_price);
  return {
    level: asStr(o.level),
    serviceId: asStr(o.service_id),
    title: asStr(o.title),
    price: Number.isFinite(price) && price > 0 ? price : undefined,
    days: asNum(p.standard_duration),
    docsCount: asArr(p.required_documents).filter((x) => asStr(x)).length,
    advokatRequired: Boolean(p.advokat_required),
  };
}

// GET /ai/legal-corpus — the official sources the AI answers from (shown before the first analysis).
export async function getLegalCorpus(): Promise<LegalSource[]> {
  return sources(listFrom(await http("/ai/legal-corpus"), "items", "data", "sources"));
}

export async function classifyProblem(text: string): Promise<Classification> {
  const d = asDict(await http("/ai/classify", { method: "POST", body: { text } }));
  return {
    category: asStr(d.category),
    executorType: asStr(d.executor_type),
    urgency: asStr(d.urgency, "normal"),
    summary: typeof d.summary === "string" ? d.summary : "",
    recommendedService: asStr(d.recommended_service ?? d.service),
    leadId: asStr(d.lead_id) || undefined,
    offers: asArr(d.offer_levels).map(offer).filter((o) => o.serviceId),
    sources: sources(d.sources),
    disclaimer: asStr(d.disclaimer),
    answerStatus: asStr(d.answer_status),
  };
}

// POST /ai/feedback — "useful / not useful"; not useful goes to the lawyer-moderator queue.
export async function sendIntakeFeedback(useful: boolean, requestId: string): Promise<void> {
  await http("/ai/feedback", { method: "POST", body: { useful, comment: "", request_id: requestId } });
}
