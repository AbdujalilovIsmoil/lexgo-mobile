import type { Messages } from "../uz";

export const admLeadsB: Messages["admLeadsB"] = {
  region: {
    tashkent: "Tashkent city", samarkand: "Samarkand", fergana: "Fergana", bukhara: "Bukhara", namangan: "Namangan", andijan: "Andijan",
    kashkadarya: "Kashkadarya", khorezm: "Khorezm", jizzakh: "Jizzakh", navoi: "Navoi",
  },
  cat: {
    family: "Family", contract: "Contract", court: "Court", criminal: "Criminal", administrative: "Administrative", housing: "Housing", tax: "Tax",
    labor: "Labor", business: "Business", debt: "Debt", documents: "Documents", general: "General", login: "Sign-in", registration: "Registration",
    kanban: "Kanban",
  },
  source: {
    web: "Website", referral: "Referral", ad: "Ad", ads: "Ads", organic: "Organic", manual: "Manual", phone: "Phone", call: "Call", chat: "Chat",
    ai: "AI", lexgo_ai: "LexGo AI", ai_classify: "AI analysis", social: "Social", seo: "SEO", google: "Google", telegram: "Telegram",
    mobile: "Mobile app", callcenter: "Duty desk", login: "Sign-in", registration: "Registration", register_start: "Registration",
    seller_register_request: "Seller application", gift: "Gift", sos: "SOS", template: "Template", onboarding: "Onboarding",
  },
  urgency: {
    low: "Low", normal: "Normal", high: "High", critical: "Critical", urgent: "Urgent",
  },
  score: { hot: "Hot", warm: "Warm", cold: "Cold" },
  lost: {
    price: "Price", solved_self: "Solved it themselves", competitor: "Went elsewhere", no_answer: "No answer", no_service: "No such service",
    spam: "Spam / duplicate",
  },
  tl: { kanban_move: "Stage changed", created: "Lead created", updated: "Lead updated", re_engage: "Re-engaged" },
  meetNoUser: "No platform user with this phone number — the client needs to sign up first.",
  meetSelf: "You cannot start a meeting with yourself.",
  meetDenied: "You are not allowed to start meetings. Contact an administrator.",
  meetMissing: "This feature is waiting for the backend.",
  meetError: "Could not start the meeting. Try again.",
};
