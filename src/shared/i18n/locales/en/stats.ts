import type { Messages } from "../uz";

export const stats: Messages["stats"] = {
  lawyers: {"title": "Lawyers & advocates", "sub": "Verified specialists on the platform", "total": "Total", "advocates": "Advocates", "lawyers": "Lawyers", "top": "Top rated", "cta": "See all"},
  templates: {"title": "Document templates", "sub": "Ready documents and services by practice area", "total": "Services", "cta": "Open services"},
  response: {"title": "Response guarantee", "sub": "A lawyer replies within 30 minutes", "cta": "Ask AI", "steps": [{"title": "You pay through the platform", "text": "Payment is held in escrow and tied to the guarantee."}, {"title": "The lawyer is monitored", "text": "Deadlines are tracked and you get a written update every 5 days."}, {"title": "Problems escalate", "text": "No reply — the case goes to a manager automatically."}, {"title": "Your loss is covered", "text": "A replacement lawyer is assigned or LexGo resolves it."}]},
  coverage: {"title": "Coverage by region", "sub": "How many specialists in each region", "empty": "No data", "cta": "See lawyers"},
};
