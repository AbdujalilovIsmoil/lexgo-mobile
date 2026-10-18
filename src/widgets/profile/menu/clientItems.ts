import { cItem as i, cSection as sec, item, type MenuSection } from "./types";

// Mirrors the web sidebar (law-main PortalShell CLIENT_NAV) in its order and names; the
// last section keeps the mobile-only account screens (entitlements, consents); profile/cards/family live inline on the Profile page.
export const CLIENT_SECTIONS: MenuSection[] = [
  sec("main", [
    i("dashboard", "grid", "/"), i("sos", "alert-triangle", "/sos"), i("urgent", "zap", "/urgent"), i("services", "search", "/services"),
    i("documents", "file-text", "/documents"), i("lawyers", "users", "/lawyers"), i("works", "briefcase", "/works"),
    i("messages", "message-circle", "/messages"), i("notifications", "bell", "/notifications", "notifications"), i("ai", "star", "/ai"), i("intake", "clipboard", "/intake"),
  ]),
  sec("learn", [i("academy", "book-open", "/academy"), i("packages", "package", "/packages"), i("marketplaceOrders", "tag", "/orders"), i("matches", "target", "/matches")]),
  sec("billing", [i("subscription", "star", "/subscription"), i("payments", "credit-card", "/payments"), i("gifts", "gift", "/profile/gifts"), i("referrals", "user-plus", "/profile/referral")]),
  sec("feedback", [i("reviews", "star", "/ratings"), i("warranty", "shield", "/warranty"), i("complaints", "clipboard", "/complaints"), i("support", "headphones", "/support", "support")]),
  sec("personal", [item("entitlements", "award", "/entitlements"), item("consents", "check-square", "/profile/consents")]),
];
