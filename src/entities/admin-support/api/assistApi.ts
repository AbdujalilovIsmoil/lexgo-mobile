import { http } from "@/shared/api";
import type { AssistContext } from "../model/assistTypes";
import type { DocResult, MarketResult, PlanCheckout, PlanPreview, UrgentResult } from "../model/resultTypes";
import { normContext } from "./assistContext";
import { normCheckout, normPreview } from "./assistPlanResult";
import { normDocResult, normMarketResult } from "./assistDocMarket";
import { normUrgentResult } from "./assistUrgentResult";
import { marketBody, type MarketInput } from "./marketBody";

export type { MarketInput };

const path = (id: string, tail: string) => `/call-center/support/tickets/${encodeURIComponent(id)}/assist/${tail}`;
const post = (id: string, tail: string, body: unknown) => http(path(id, tail), { method: "POST", body });

export type PlanInput = { planId: string; period: string };
export type DocInput = { serviceId?: string; templateId?: string; title: string; need: string; language: string; docType: string };
export type UrgentInput = { kind: string; channel: string; need: string; directions: string[]; lawyerCount?: number };

export async function getAssistContext(id: string): Promise<AssistContext> {
  return normContext(await http(path(id, "context")));
}

// Price quote only: it shows the client the price in the chat but creates no payment.
export async function previewPlan(id: string, i: PlanInput): Promise<PlanPreview> {
  return normPreview(await post(id, "subscription-preview", { plan_id: i.planId, billing_period: i.period, currency: "UZS" }));
}

// Creates the purchase request and sends it to Telegram for approval.
export async function checkoutPlan(id: string, i: PlanInput): Promise<PlanCheckout> {
  return normCheckout(await post(id, "subscription-checkout", { plan_id: i.planId, billing_period: i.period, currency: "UZS" }));
}

export async function requestDocument(id: string, i: DocInput): Promise<DocResult> {
  const body: Record<string, unknown> = { title: i.title.trim(), need: i.need.trim(), language: i.language, requested_document_type: i.docType.trim(), answers: {} };
  if (i.serviceId) body.service_id = i.serviceId;
  if (i.templateId) body.template_id = i.templateId;
  return normDocResult(await post(id, "document-lawyer-request", body));
}

export async function requestMarket(id: string, i: MarketInput): Promise<MarketResult> {
  return normMarketResult(await post(id, "marketplace-purchase-request", marketBody(i)));
}

export async function requestUrgent(id: string, i: UrgentInput): Promise<UrgentResult> {
  const body: Record<string, unknown> = { service_kind: i.kind, channel: i.channel, need: i.need.trim(), directions: i.directions, files: [], voice_messages: [] };
  if (i.lawyerCount) body.lawyer_count = i.lawyerCount;
  return normUrgentResult(await post(id, "urgent-advokat-request", body));
}
