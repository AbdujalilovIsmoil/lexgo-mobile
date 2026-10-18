import type { IconName } from "@/shared/ui";

export type TabRole = "guest" | "client" | "seller" | "callcenter" | "staff";
// `needs`: shown only when that admin module is open to the user; `hideWith`: hidden when that module's tab is shown instead.
export type TabDef = { route: string; icon: IconName; labelKey: string; center?: boolean; badge?: string; needs?: string; hideWith?: string; auth?: boolean };

const t = (route: string, icon: IconName, labelKey: string, badge?: string): TabDef => ({ route, icon, labelKey, badge });
const ai: TabDef = { route: "ai", icon: "zap", labelKey: "tabs.ai", center: true };
const messages = t("messages", "message-circle", "tabs.messages", "messages");
const profile = t("profile", "user", "tabs.profile");

// TZ 44 information architecture. Client and professional bars keep the AI
// centre button, so their Profil lives behind the avatar in the page headers
// (decision recorded in TZ_STATUS.md); call-center and staff bars follow the TZ
// list or the permission hub.
export const TABS: Record<TabRole, TabDef[]> = {
  // A visitor gets the client's bar and pages; the two tabs that hold personal data (`auth`) send them to sign in when pressed.
  guest: [t("index", "home", "tabs.home"), t("services", "grid", "tabs.services"), ai, { ...t("works", "briefcase", "tabs.works"), auth: true }, { ...messages, auth: true }],
  client: [t("index", "home", "tabs.home"), t("services", "grid", "tabs.services"), ai, t("works", "briefcase", "tabs.works"), messages],
  seller: [t("workspace", "layers", "tabs.workspace"), t("requests", "inbox", "tabs.requests", "requests"), ai, t("clients", "users", "tabs.clients"), messages],
  callcenter: [t("leads", "trending-up", "tabs.leads"), t("csupport", "headphones", "tabs.support", "support"), t("cclients", "users", "tabs.clients"), t("cmeetings", "video", "tabs.meetings"), profile],
  staff: [t("index", "home", "tabs.home"), t("admin", "sliders", "tabs.admin"), ai, { ...t("hrm", "users", "tabs.hrm"), needs: "internal" }, { ...t("notifs", "bell", "tabs.notifications", "notifications"), hideWith: "internal" }, profile],
};

// Tab routes that belong to a role's bar are listed above; these extra routes are
// still reachable (pushed from Home, Profil, deep links) without a bar slot.
const ALWAYS = ["profile", "services", "lawyers", "orders", "messages"];
export const allowedRoutes = (role: TabRole): string[] => [...TABS[role].map((x) => x.route), ...ALWAYS];

// The tab a role lands on (also where a role switch / sign-out sends the user).
export const homeRoute = (role: TabRole): string => TABS[role][0].route;
