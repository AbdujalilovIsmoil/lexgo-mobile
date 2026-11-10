import type { IconName } from "@/shared/ui";
import { COMMON_SECTION } from "@/widgets/profile/menu/commonItems";
import { PRO_SECTIONS } from "@/widgets/profile/menu/proItems";
import type { TabRole } from "@/widgets/tab-bar/tabConfig";
import { storeRows } from "@/shared/store-rules";

export type NavItem = { key: string; icon: IconName; route: string; badge?: "notifications" | "support"; label?: string };

// The web client sidebar (law-main PortalShell CLIENT_NAV) in its exact order, without Boshqaruv paneli, Tezkor advokat, Huquqiy hujjatlar and Advokat va yuristlar (Home and the tab bar lead there), SOS (Home has its own button), Mening so'rovlarim (a row on /urgent), AI, Mening ishlarim and Xabarlar (the tab bar has them), Mening hujjatlarim (the works page links to it), Shikoyatlar, Roziliklar, To'lovlar, Sovg'alar, Do'stni taklif qilish and Yordam markazi (the profile has them; the header's headset opens support); titles are cpd.menu.<key> (or `label` when the web has no such row).
export const NAV: NavItem[] = storeRows([
  { key: "intake", icon: "clipboard", route: "/intake" },
  // { key: "academy", icon: "book-open", route: "/academy" }, // off for now
  { key: "packages", icon: "package", route: "/packages" },
  { key: "marketplaceOrders", icon: "tag", route: "/orders" },
  { key: "matches", icon: "target", route: "/matches" },
  // { key: "nearby", icon: "map", route: "/nearby", label: "mmap.entry" }, // off for now
  { key: "subscription", icon: "award", route: "/subscription" },
  { key: "reviews", icon: "star", route: "/ratings" },
  { key: "warranty", icon: "shield", route: "/warranty" },
], (i) => i.route);

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
function sellerNav(s: Seller): { main: NavItem[]; account: NavItem[]; settings: NavItem[] } {
  const lawyer = s.kind !== "advocate";
  const web = lawyer
    ? [row("dashboard", "grid", "/(tabs)/workspace"), row("marketplace", "briefcase", "/pro/market"), row("marketplaceOrders", "tag", "/pro/orders"), row("cases", "file-text", "/pro/cases"), row("urgentAssigned", "zap", "/pro/urgent"), row("tasks", "check-square", "/pro/tasks"), row("calendar", "calendar", "/pro/calendar"), row("clients", "users", "/(tabs)/clients"), row("services", "target", "/pro/services"), row("documents", "file", "/pro/templates"), row("documentRequests", "file-text", "/pro/docs"), row("files", "folder-plus", "/pro/files"), row("chat", "message-circle", "/(tabs)/messages"), row("meetings", "video", "/meetings"), row("notifications", "bell", "/notifications", "notifications"), row("ai", "star", "/(tabs)/ai"), row("assistant", "cpu", "/pro/assistant"), row("referrals", "gift", "/pro/referrals"), row("promotion", "zap", "/pro/promotions"), row("subscription", "award", "/subscription"), row("support", "headphones", "/support", "support")]
    : [row("dashboard", "grid", "/(tabs)/workspace"), row("opportunities", "briefcase", "/pro/market"), row("marketplaceOrders", "tag", "/pro/orders"), row("cases", "file-text", "/pro/cases"), row("urgentAssigned", "zap", "/pro/urgent"), row("documentRequests", "file-text", "/pro/docs"), row("calendar", "calendar", "/pro/calendar"), row("clients", "users", "/(tabs)/clients"), row("services", "target", "/pro/services"), row("tasks", "check-square", "/pro/tasks"), row("messages", "message-circle", "/(tabs)/messages"), row("meetings", "video", "/meetings"), row("notifications", "bell", "/notifications", "notifications"), row("files", "folder-plus", "/pro/files"), row("assistant", "cpu", "/pro/assistant"), row("referrals", "gift", "/pro/referrals"), row("promotion", "zap", "/pro/promotions"), row("subscription", "award", "/subscription"), row("support", "headphones", "/support", "support")];
  const extra = flat(PRO_SECTIONS).filter((i) => ["stats", "availability", "experience", "achievements", "onboarding", "proPackages"].includes(i.key));
  const office: NavItem = { key: "office", icon: "map-pin", route: "/pro/office", label: "mmap.office.entry" }; // the office on the map (routes for clients)
  // What the profile page used to list for a professional: the account screens (personal data, payments, plan, family, cards, consents,
  // gifts, complaints, warranty). The profile keeps no links; they live here. Like the settings below they are always there (an account
  // under review can still reach its own data).
  const account = ACCOUNT.map((a) => ({ ...a, label: `py9.menu.${a.key}` }));
  const settings = flat([COMMON_SECTION]).filter((i) => i.key !== "notifications"); // app settings: always there
  return { main: storeRows([...web, ...extra, office], (i) => i.route).filter((i) => !sellerRowHidden(i.key, s)), account: storeRows(account, (i) => i.route), settings };
}

// The phone drawer of a professional, built like the client's: no row repeats what the tab bar or the header already opens (the
// workspace, clients, chats, notifications), and the rest is grouped by how often it is needed — the day's work first (Asosiy), then the
// tools (Vositalar), growth (O'sish), the account (Hisob), the app (Ilova) and help (Yordam). Same permission rules as navFor.
const IN_TABS = new Set(["dashboard", "clients", "chat", "messages", "notifications"]);
const GROUPS: { key: "main" | "tools" | "growth" | "help"; keys: string[] }[] = [
  { key: "main", keys: ["urgentAssigned", "opportunities", "marketplace", "marketplaceOrders", "documentRequests", "cases", "calendar", "tasks", "meetings"] },
  { key: "tools", keys: ["assistant", "ai", "services", "documents", "files", "office", "availability", "experience", "achievements", "stats", "onboarding", "proPackages"] },
  { key: "growth", keys: ["subscription", "promotion", "referrals"] },
  { key: "help", keys: ["support"] },
];
export type DrawerGroup = { key: "main" | "tools" | "growth" | "account" | "app" | "help"; items: NavItem[] };
export function sellerSections(s: Seller = {}): DrawerGroup[] {
  const x = sellerNav(s);
  // The onboarding steps matter while the account is under review; an approved account (limited === false) no longer needs the row.
  const byKey = new Map(x.main.filter((i) => !IN_TABS.has(i.key) && !(i.key === "onboarding" && s.limited === false)).map((i) => [i.key, i]));
  const pick = (keys: string[]) => keys.map((k) => byKey.get(k)).filter((i): i is NavItem => !!i);
  const placed = new Set(GROUPS.flatMap((g) => g.keys));
  const rest = [...byKey.values()].filter((i) => !placed.has(i.key)); // a row added to the web sidebar later still shows up (in Vositalar)
  const groups: DrawerGroup[] = [
    { key: "main", items: pick(GROUPS[0].keys) },
    { key: "tools", items: [...pick(GROUPS[1].keys), ...rest] },
    { key: "growth", items: pick(GROUPS[2].keys) },
    { key: "account", items: x.account },
    { key: "app", items: x.settings },
    { key: "help", items: pick(GROUPS[3].keys) },
  ];
  return groups.filter((g) => g.items.length);
}
const sellerFlat = (s: Seller): NavItem[] => { const x = sellerNav(s); return [...x.main, ...x.account, ...x.settings]; };

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
export const navFor = (role: TabRole, seller: Seller = {}): NavItem[] => (role === "seller" ? sellerFlat(seller) : NAV);

// Mobile-only account screens that the web has no sidebar row for.
export const EXTRA: NavItem[] = storeRows([
  { key: "entitlements", icon: "award", route: "/entitlements" },
], (i) => i.route);

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
