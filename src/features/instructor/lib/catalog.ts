import type { TargetBody } from "@/entities/instructor";
import { tr } from "./tr";

// Destination targets on OTHER screens (id, type, label key, mobile route). The backend answers a question like
// "where do I buy Pro?" with navigate + highlight of the target it knows lives on the destination, exactly as the
// web sends its cross-page registry. Screens still have to register the same id to be highlighted.
const CLIENT: [string, string, string, string][] = [
  ["pricing.plan.lexgo-ai-pro", "card", "planPro", "/subscription"],
  ["pricing.plan.lexgo-ai-lite", "card", "planLite", "/subscription"],
  ["pricing.plan.lexgo-ai-free", "card", "planFree", "/subscription"],
  ["pricing.plan.shaxsiy-advokat-standard", "card", "planStandard", "/subscription"],
  ["pricing.plan.shaxsiy-advokat-premium", "card", "planPremium", "/subscription"],
  ["pricing.telegram-request-modal", "modal", "telegramModal", "/subscription"],
  ["documents.create.open", "button", "docCreate", "/services"],
  ["documents.catalog.search", "input", "docSearch", "/services"],
  ["documents.my.list", "list", "myDocs", "/documents"],
  ["marketplace.ai-search.input", "input", "aiSearch", "/lawyers"],
  ["marketplace.filters.seller-type", "select", "sellerType", "/lawyers"],
  ["support.operator-handoff.button", "button", "operator", "/support"],
  ["support.new-ticket", "section", "newTicket", "/support"],
  ["urgent_advokat.services", "section", "urgentServices", "/urgent"],
  ["urgent_advokat.service.video-consultation", "card", "urgentVideo", "/urgent"],
  ["urgent_advokat.service.chat-consultation", "card", "urgentChat", "/urgent"],
  ["works.list", "list", "works", "/works"],
];
// Sellers (lawyer / advocate) share plans and support only.
const SELLER = CLIENT.filter(([, , , route]) => route === "/subscription" || route === "/support");

export function crossTargets(role: string, skip: Set<string>): TargetBody[] {
  const list = role === "client" ? CLIENT : role === "lawyer" || role === "advocate" ? SELLER : [];
  return list.filter(([id]) => !skip.has(id)).map(([id, type, key, route]) => ({ ai_id: id, type, label: tr(`ax4.${key}`), route: `/mobile/${role}${route}` }));
}
