import type { TabIconName } from "./tabIcons";

export type TabRole = "guest" | "client" | "seller";
// `href`: a slot that opens a stack page instead of a tab (none uses it now: Tezkor is a tab of its own, so the bar stays under it).
export type TabDef = { route: string; icon: TabIconName; labelKey: string; center?: boolean; badge?: string; auth?: boolean; href?: string };

const t = (route: string, icon: TabIconName, labelKey: string, badge?: string): TabDef => ({ route, icon, labelKey, badge });
const ai: TabDef = { route: "ai", icon: "zap", labelKey: "tabs.ai", center: true };
// Adliya: a client's centre button is Tezkor (the urgent advocate); their AI is the floating button in the bottom right corner (FlatBar).
const urgent: TabDef = { route: "urgent", icon: "bolt", labelKey: "tabs.bar.urgent", center: true };
const messages = t("messages", "message-circle", "tabs.messages", "messages");
// A client's (and a visitor's) last slot is Profil (the `me` tab: the profile page itself); their chats sit behind the header button next to the bell.
const me = t("me", "user", "tabs.profile");
// A client's fourth slot is the specialists directory (Mutaxassislar); their orders are reached from Home, the profile and a purchase.
const experts = t("lawyers", "users", "tabs.bar.experts");

// The bar's captions are short ones of their own (tabs.bar.*); the pages keep their titles. A professional's bar is the client's bar:
// the same home icon and caption (Asosiy) in the first slot, the same AI centre button, the same one-word captions. The mobile app's roles: a visitor, a client and a professional (advokat or yurist). Both bars keep the AI centre button, so Profil
// lives behind the avatar in the page headers.
export const TABS: Record<TabRole, TabDef[]> = {
  // A visitor gets the client's bar and pages; the tabs that need an account (`auth`: Tezkor, orders, profile) send them to sign in when pressed.
  // The fourth slot is the specialists directory (public; the orders tab stays reachable from Home and the profile).
  guest: [t("index", "home", "tabs.bar.home"), t("services", "grid", "tabs.bar.services"), { ...urgent, auth: true }, experts, { ...me, auth: true }],
  client: [t("index", "home", "tabs.bar.home"), t("services", "grid", "tabs.bar.services"), urgent, experts, me],
  seller: [t("workspace", "home", "tabs.bar.home"), t("requests", "inbox", "tabs.requests", "requests"), ai, t("clients", "users", "tabs.clients"), messages],
};

// Tab routes that belong to a role's bar are listed above; these extra routes are
// still reachable (pushed from Home, the profile, deep links) without a bar slot.
const ALWAYS = ["services", "lawyers", "orders", "works", "messages", "ai"];
export const allowedRoutes = (role: TabRole): string[] => [...TABS[role].map((x) => x.route), ...ALWAYS];

// A professional's bar follows the same permission rules as the drawer (the web PortalShell): an account still under
// review keeps its workspace and the AI button only; the chats tab needs the cabinet's secure_chat action. Unknown
// (cabinet still loading) hides nothing.
export function sellerTabHidden(route: string, limited: boolean, actions?: { secureChat: boolean }): boolean {
  if (limited) return route !== "workspace" && route !== "ai";
  return route === "messages" && !!actions && !actions.secureChat;
}

// The roles whose AI is the floating button (their centre slot is Tezkor).
export const floatingAi = (role: TabRole): boolean => role !== "seller";

// The tab a role lands on (also where a role switch / sign-out sends the user).
export const homeRoute = (role: TabRole): string => TABS[role][0].route;
