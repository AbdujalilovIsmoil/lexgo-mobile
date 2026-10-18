// Canonical target ids the backend knows (GET /ai/instructor/contract → target_aliases) and the
// helpers for the dynamic ones. A screen may register either spelling; they resolve to each other.
export const AI_IDS = {
  launcher: "dashboard.ai-instructor.open",
  createDocument: "documents.create.open",
  documentSearch: "documents.catalog.search",
  myDocuments: "documents.my.list",
  lawyerSearch: "marketplace.ai-search.input",
  operatorHandoff: "support.operator-handoff.button",
  newTicket: "support.new-ticket",
  urgentServices: "urgent_advokat.services",
  works: "works.list",
  telegramModal: "pricing.telegram-request-modal",
} as const;

const seg = (v: string) => v.trim().replace(/[\s.:/\\]+/g, "-");
export const planCardId = (slug: string) => `pricing.plan.${seg(slug)}`;
export const planBuyId = (slug: string) => `pricing.plan.${seg(slug)}.buy`;
export const urgentServiceId = (kind: string) => `urgent_advokat.service.${seg(kind).replace(/_/g, "-")}`;
export const sellerServiceBuyId = (seller: string, service: string) => `marketplace.seller.${seg(seller)}.service.${seg(service)}.buy`;
