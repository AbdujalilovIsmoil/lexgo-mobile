import type { TabIconName } from "./tabIcons";

export type TabRole = "guest" | "client" | "seller";
export type TabDef = { route: string; icon: TabIconName; labelKey: string; center?: boolean; badge?: string; auth?: boolean };

const t = (route: string, icon: TabIconName, labelKey: string, badge?: string): TabDef => ({ route, icon, labelKey, badge });
const ai: TabDef = { route: "ai", icon: "zap", labelKey: "tabs.ai", center: true };
const messages = t("messages", "message-circle", "tabs.messages", "messages");

// The bar's captions are short ones of their own (tabs.bar.*); the pages keep their titles. A professional's bar is the client's bar:
// the same home icon and caption (Asosiy) in the first slot, the same AI centre button, the same one-word captions. The mobile app's roles: a visitor, a client and a professional (advokat or yurist). Both bars keep the AI centre button, so Profil
// lives behind the avatar in the page headers.
export const TABS: Record<TabRole, TabDef[]> = {
  // A visitor gets the client's bar and pages; the two tabs that hold personal data (`auth`) send them to sign in when pressed.
  // The fourth slot is the client's orders (Buyurtmalarim): the backend closes the works page (client_works) to the client role.
  guest: [t("index", "home", "tabs.bar.home"), t("services", "grid", "tabs.bar.services"), ai, { ...t("orders", "shopping-bag", "tabs.bar.orders"), auth: true }, { ...messages, auth: true }],
  client: [t("index", "home", "tabs.bar.home"), t("services", "grid", "tabs.bar.services"), ai, t("orders", "shopping-bag", "tabs.bar.orders"), messages],
  seller: [t("workspace", "home", "tabs.bar.home"), t("requests", "inbox", "tabs.requests", "requests"), ai, t("clients", "users", "tabs.clients"), messages],
};

// Tab routes that belong to a role's bar are listed above; these extra routes are
// still reachable (pushed from Home, the profile, deep links) without a bar slot.
const ALWAYS = ["services", "lawyers", "orders", "works", "messages"];
export const allowedRoutes = (role: TabRole): string[] => [...TABS[role].map((x) => x.route), ...ALWAYS];

// A professional's bar follows the same permission rules as the drawer (the web PortalShell): an account still under
// review keeps its workspace and the AI button only; the chats tab needs the cabinet's secure_chat action. Unknown
// (cabinet still loading) hides nothing.
export function sellerTabHidden(route: string, limited: boolean, actions?: { secureChat: boolean }): boolean {
  if (limited) return route !== "workspace" && route !== "ai";
  return route === "messages" && !!actions && !actions.secureChat;
}

// The tab a role lands on (also where a role switch / sign-out sends the user).
export const homeRoute = (role: TabRole): string => TABS[role][0].route;
