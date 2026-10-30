import type { IconName } from "@/shared/ui";
import { COMMON_SECTION } from "@/widgets/profile/menu/commonItems";
import { PRO_SECTIONS } from "@/widgets/profile/menu/proItems";
import type { TabRole } from "@/widgets/tab-bar/tabConfig";

export type NavItem = { key: string; icon: IconName; route: string; badge?: "notifications" | "support"; label?: string };

// The web client sidebar (law-main PortalShell CLIENT_NAV) in its exact order, without Boshqaruv paneli, Tezkor advokat and Huquqiy hujjatlar (Home and the tab bar lead there), SOS (Home has its own button), Mening so'rovlarim (a row on /urgent), AI, Mening ishlarim and Xabarlar (the tab bar has them), Mening hujjatlarim (the works page links to it); titles are cpd.menu.<key> (or `label` when the web has no such row).
export const NAV: NavItem[] = [
  { key: "lawyers", icon: "users", route: "/lawyers" },
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

const flat = (sections: { items: NavItem[] }[]): NavItem[] => sections.flatMap((s) => s.items).map((i) => ({ ...i, label: i.label ?? `nav1.menu.${i.key}` }));

// What the drawer lists for each role: the client (and the visitor) get the web portal's rows; a professional gets their home and
// tabs first, then the tools of their role, then notifications and the account/app settings.
const row = (key: string, icon: IconName, route: string, badge?: NavItem["badge"]): NavItem => ({ key, icon, route, label: `lsb.${key}`, badge });
export type Seller = { kind?: string; limited?: boolean; actions?: { acceptOrders: boolean; secureChat: boolean } };

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
    ? [row("dashboard", "grid", "/(tabs)/workspace"), row("marketplace", "briefcase", "/pro/market"), row("marketplaceOrders", "tag", "/pro/orders"), row("cases", "file-text", "/pro/cases"), row("urgentAssigned", "zap", "/pro/urgent"), row("tasks", "check-square", "/pro/tasks"), row("calendar", "calendar", "/pro/calendar"), row("clients", "users", "/(tabs)/clients"), row("services", "target", "/pro/services"), row("documents", "file", "/pro/templates"), row("documentRequests", "file-text", "/pro/docs"), row("files", "folder-plus", "/pro/files"), row("chat", "message-circle", "/(tabs)/messages"), row("meetings", "video", "/meetings"), row("notifications", "bell", "/notifications", "notifications"), row("ai", "star", "/(tabs)/ai"), row("assistant", "cpu", "/pro/assistant"), row("referrals", "gift", "/pro/referrals"), row("promotion", "zap", "/pro/promotions"), row("subscription", "award", "/subscription"), row("support", "headphones", "/support", "support")]
    : [row("dashboard", "grid", "/(tabs)/workspace"), row("opportunities", "briefcase", "/pro/market"), row("marketplaceOrders", "tag", "/pro/orders"), row("cases", "file-text", "/pro/cases"), row("urgentAssigned", "zap", "/pro/urgent"), row("documentRequests", "file-text", "/pro/docs"), row("calendar", "calendar", "/pro/calendar"), row("clients", "users", "/(tabs)/clients"), row("services", "target", "/pro/services"), row("tasks", "check-square", "/pro/tasks"), row("messages", "message-circle", "/(tabs)/messages"), row("meetings", "video", "/meetings"), row("notifications", "bell", "/notifications", "notifications"), row("files", "folder-plus", "/pro/files"), row("assistant", "cpu", "/pro/assistant"), row("referrals", "gift", "/pro/referrals"), row("promotion", "zap", "/pro/promotions"), row("subscription", "award", "/subscription"), row("support", "headphones", "/support", "support")];
  const extra = flat(PRO_SECTIONS).filter((i) => ["stats", "availability", "experience", "achievements", "onboarding", "proPackages"].includes(i.key));
  // What the profile page used to list for a professional: the account screens (personal data, payments, plan, family, cards, consents,
  // gifts, complaints, warranty). The profile keeps no links; they live here. Like the settings below they are always there (an account
  // under review can still reach its own data).
  const account = ACCOUNT.map((a) => ({ ...a, label: `py9.menu.${a.key}` }));
  const settings = flat([COMMON_SECTION]).filter((i) => i.key !== "notifications"); // app settings: always there
  return [...[...web, ...extra].filter((i) => !sellerRowHidden(i.key, s)), ...account, ...settings];
}

// Account screens of a professional, in the profile's old order (referrals are the "referrals" row of the web sidebar already).
const ACCOUNT: NavItem[] = [
  { key: "edit", icon: "edit-3", route: "/profile/edit" },
  { key: "payments", icon: "file-text", route: "/payments" },
  { key: "plan", icon: "layers", route: "/entitlements" },
  { key: "family", icon: "users", route: "/profile/family" },
  { key: "methods", icon: "credit-card", route: "/profile/methods" },
  { key: "consents", icon: "check-square", route: "/profile/consents" },
  { key: "gifts", icon: "gift", route: "/profile/gifts" },
  { key: "complaints", icon: "message-square", route: "/complaints" },
  { key: "warranty", icon: "shield", route: "/warranty" },
];
export const navFor = (role: TabRole, seller: Seller = {}): NavItem[] => (role === "seller" ? sellerNav(seller) : NAV);

// Mobile-only account screens that the web has no sidebar row for.
export const EXTRA: NavItem[] = [
  { key: "entitlements", icon: "award", route: "/entitlements" },
  { key: "consents", icon: "check-square", route: "/profile/consents" },
];

// The team's task section (the web's "Jamoa vazifalari"): a row for anyone who holds `tasks.view`, whatever their role — the people who use
// it (the team's developers, managers) are clients or yurists by role. First in the drawer, so it is there right after signing in.
export const TEAM_TASKS: NavItem = { key: "teamTasks", icon: "check-square", route: "/team-tasks", label: "ttm.title" };

// What a visitor may open from the drawer; the rest asks to sign in.
export const GUEST_OPEN = ["/", "/services", "/lawyers", "/ai", "/academy", "/packages", "/subscription"];

export const isActive = (route: string, path: string): boolean => {
  const r = route.split("?")[0].replace("/(tabs)", "") || "/";
  if (r === "/urgent" && path.startsWith("/urgent/requests")) return false;
  return r === "/" ? path === "/" : path === r || path.startsWith(`${r}/`);
};
