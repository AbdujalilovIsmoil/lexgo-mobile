import type { IconName } from "@/shared/ui";
import { CC_SECTIONS, COMMON_SECTION, STAFF_SECTIONS } from "@/widgets/profile/menu/staffItems";
import { PRO_SECTIONS } from "@/widgets/profile/menu/proItems";
import type { TabRole } from "@/widgets/tab-bar/tabConfig";

export type NavItem = { key: string; icon: IconName; route: string; badge?: "notifications" | "support"; label?: string };

// The web client sidebar (law-main PortalShell CLIENT_NAV) in its exact order; titles are cpd.menu.<key> (or `label` when the web has no such row).
export const NAV: NavItem[] = [
  { key: "dashboard", icon: "grid", route: "/" },
  { key: "sos", icon: "alert-triangle", route: "/sos" },
  { key: "urgent", icon: "zap", route: "/urgent" },
  { key: "urgentMine", icon: "list", route: "/urgent/requests", label: "ug1.mine" },
  { key: "services", icon: "search", route: "/services" },
  { key: "documents", icon: "file-text", route: "/documents" },
  { key: "lawyers", icon: "users", route: "/lawyers" },
  { key: "works", icon: "briefcase", route: "/works" },
  { key: "messages", icon: "message-circle", route: "/messages" },
  { key: "ai", icon: "star", route: "/ai" },
  { key: "intake", icon: "clipboard", route: "/intake" },
  { key: "academy", icon: "book-open", route: "/academy" },
  { key: "packages", icon: "package", route: "/packages" },
  { key: "marketplaceOrders", icon: "tag", route: "/orders" },
  { key: "matches", icon: "target", route: "/matches" },
  { key: "subscription", icon: "award", route: "/subscription" },
  { key: "payments", icon: "credit-card", route: "/payments" },
  { key: "gifts", icon: "gift", route: "/profile/gifts" },
  { key: "referrals", icon: "user-plus", route: "/profile/referral" },
  { key: "reviews", icon: "star", route: "/ratings" },
  { key: "warranty", icon: "shield", route: "/warranty" },
  { key: "complaints", icon: "clipboard", route: "/complaints" },
  { key: "support", icon: "headphones", route: "/support", badge: "support" },
];

const tab = (key: string, icon: IconName, route: string, label: string, badge?: NavItem["badge"]): NavItem => ({ key, icon, route, label, badge });
const flat = (sections: { items: NavItem[] }[]): NavItem[] => sections.flatMap((s) => s.items).map((i) => ({ ...i, label: i.label ?? `nav1.menu.${i.key}` }));

// What the drawer lists for each role: the client (and the visitor) get the web portal's rows; the others get their own home and
// tabs first, then the tools of their role, then notifications and the account/app settings.
const row = (key: string, icon: IconName, route: string, badge?: NavItem["badge"]): NavItem => ({ key, icon, route, label: `lsb.${key}`, badge });
export type Seller = { kind?: string; orgOwner?: boolean; limited?: boolean; actions?: { acceptOrders: boolean; secureChat: boolean }; modules?: ReadonlySet<string> };

// The web sidebar of a sales operator (AdminShell groups "Mijozlar va sotuv" → "Katalog va buyurtmalar" → "Yordam va huquq") in its
// order: the funnel, duty desk and meetings are tabs, the rest open their admin screens. A row needs its module (`modules`).
const SALES: { mod: string; row: NavItem }[] = [
  { mod: "pipeline", row: tab("pipeline", "trending-up", "/(tabs)/pipeline", "admHub.mod.pipeline.title") },
  { mod: "callcenter", row: tab("duty", "headphones", "/(tabs)/duty", "admHub.mod.callcenter.title") },
  { mod: "meetings", row: tab("smeetings", "video", "/(tabs)/smeetings", "admHub.mod.meetings.title") },
  { mod: "callAnalytics", row: tab("callAnalytics", "bar-chart-2", "/manage/callAnalytics", "admHub.mod.callAnalytics.title") },
  { mod: "marketplace", row: tab("marketplace", "shopping-bag", "/manage/marketplace", "admHub.mod.marketplace.title") },
  { mod: "notifications", row: tab("notifySend", "send", "/manage/notifications", "admHub.mod.notifications.title") },
];

// The web PortalShell's permission rules, the same for a yurist and an advokat (only the row lists differ):
// an account still under review (cabinet `limited_access`) keeps only these rows — an advokat has no services row then —
// plus the mobile onboarding steps; and a few rows need an action the cabinet grants (`available_actions`).
// Unknown cabinet (still loading) hides nothing, like the web.
const LIMITED_OK: Record<"lawyer" | "advocate", ReadonlySet<string>> = {
  lawyer: new Set(["dashboard", "services", "subscription", "notifications", "support", "onboarding"]),
  advocate: new Set(["dashboard", "subscription", "notifications", "support", "onboarding"]),
};
const NEEDS: Record<string, "acceptOrders" | "secureChat"> = { marketplace: "acceptOrders", opportunities: "acceptOrders", chat: "secureChat", messages: "secureChat" };

export function sellerRowHidden(key: string, s: Seller): boolean {
  if (s.limited && !LIMITED_OK[s.kind === "advocate" ? "advocate" : "lawyer"].has(key)) return true;
  const need = NEEDS[key];
  return !!s.actions && !!need && !s.actions[need];
}

// The web sidebar of a yurist (law-main PortalShell LAWYER_NAV) or an advokat (ADVOCATE_NAV) in its exact order and with its own titles, then the
// mobile-only tools (stats, availability, onboarding, packages) and the app settings (notifications is already a web row).
function sellerNav(s: Seller): NavItem[] {
  const lawyer = s.kind !== "advocate";
  const web = lawyer
    ? [row("dashboard", "grid", "/(tabs)/workspace"), row("marketplace", "briefcase", "/pro/market"), row("marketplaceOrders", "tag", "/pro/orders"), row("cases", "file-text", "/pro/cases"), row("urgentAssigned", "zap", "/pro/urgent"), row("tasks", "check-square", "/pro/tasks"), row("calendar", "calendar", "/pro/calendar"), row("clients", "users", "/(tabs)/clients"), row("services", "target", "/pro/services"), row("documents", "file", "/pro/templates"), row("documentRequests", "file-text", "/pro/docs"), row("files", "folder-plus", "/pro/files"), row("chat", "message-circle", "/(tabs)/messages"), row("meetings", "video", "/meetings"), row("notifications", "bell", "/notifications", "notifications"), row("ai", "star", "/(tabs)/ai"), row("assistant", "eye", "/assistant"), row("referrals", "gift", "/pro/referrals"), row("promotion", "zap", "/pro/promotions"), row("subscription", "award", "/subscription"), row("support", "headphones", "/support", "support")]
    : [row("dashboard", "grid", "/(tabs)/workspace"), row("opportunities", "briefcase", "/pro/market"), row("marketplaceOrders", "tag", "/pro/orders"), row("cases", "file-text", "/pro/cases"), row("urgentAssigned", "zap", "/pro/urgent"), row("documentRequests", "file-text", "/pro/docs"), row("calendar", "calendar", "/pro/calendar"), row("clients", "users", "/(tabs)/clients"), row("services", "target", "/pro/services"), row("tasks", "check-square", "/pro/tasks"), row("messages", "message-circle", "/(tabs)/messages"), row("meetings", "video", "/meetings"), row("notifications", "bell", "/notifications", "notifications"), ...(s.orgOwner ? [row("organization", "briefcase", "/org")] : []), row("files", "folder-plus", "/pro/files"), row("assistant", "eye", "/assistant"), row("referrals", "gift", "/pro/referrals"), row("promotion", "zap", "/pro/promotions"), row("subscription", "award", "/subscription"), row("support", "headphones", "/support", "support")];
  const extra = flat(PRO_SECTIONS).filter((i) => ["stats", "availability", "onboarding", "proPackages"].includes(i.key));
  const settings = flat([COMMON_SECTION]).filter((i) => i.key !== "notifications"); // app settings: always there
  return [...[...web, ...extra].filter((i) => !sellerRowHidden(i.key, s)), ...settings];
}

export function navFor(role: TabRole, seller: Seller = {}): NavItem[] {
  if (role === "client" || role === "guest") return NAV;
  const common = flat([COMMON_SECTION]);
  if (role === "seller") return sellerNav(seller);
  if (role === "sales") return [...SALES.filter((x) => !seller.modules || seller.modules.has(x.mod)).map((x) => x.row), ...common];
  if (role === "callcenter") {
    return [tab("leads", "trending-up", "/(tabs)/leads", "tabs.leads"), tab("csupport", "headphones", "/(tabs)/csupport", "tabs.support", "support"), tab("cclients", "users", "/(tabs)/cclients", "tabs.clients"), tab("cmeetings", "video", "/(tabs)/cmeetings", "tabs.meetings"), ...flat(CC_SECTIONS), ...common];
  }
  return [tab("home", "home", "/", "tabs.home"), ...flat(STAFF_SECTIONS), ...common];
}

// Mobile-only account screens that the web has no sidebar row for.
export const EXTRA: NavItem[] = [
  { key: "entitlements", icon: "award", route: "/entitlements" },
  { key: "consents", icon: "check-square", route: "/profile/consents" },
];

// What a visitor may open from the drawer; the rest asks to sign in.
export const GUEST_OPEN = ["/", "/services", "/lawyers", "/ai", "/academy", "/packages", "/subscription"];

export const isActive = (route: string, path: string): boolean => {
  const r = route.split("?")[0].replace("/(tabs)", "") || "/";
  if (r === "/urgent" && path.startsWith("/urgent/requests")) return false;
  return r === "/" ? path === "/" : path === r || path.startsWith(`${r}/`);
};
