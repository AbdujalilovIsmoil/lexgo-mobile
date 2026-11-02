import type { IconName } from "@/shared/ui";
import { storeRows } from "@/shared/store-rules";

export type MenuItem = { key: string; icon: IconName; route: string; badge?: "notifications" | "support"; label?: string };
export type MenuSection = { key: string; items: MenuItem[]; label?: string };

// Strings: nav1.menu.<key> (item titles) and nav1.section.<key> (section titles).
export const item = (key: string, icon: IconName, route: string, badge?: MenuItem["badge"]): MenuItem => ({ key, icon, route, badge });

// Client rows follow the web sidebar (CLIENT_NAV); their titles live in cpd.menu.<key>.
export const cItem = (key: string, icon: IconName, route: string, badge?: MenuItem["badge"]): MenuItem => ({ key, icon, route, badge, label: `cpd.menu.${key}` });
export const cSection = (key: string, items: MenuItem[]): MenuSection => ({ key, items: storeRows(items, (i) => i.route), label: `cpd.section.${key}` });
// A section without the digital-goods rows this platform may not sell (store-rules).
export const section = (key: string, items: MenuItem[]): MenuSection => ({ key, items: storeRows(items, (i) => i.route) });
