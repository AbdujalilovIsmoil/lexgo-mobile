import { item, type MenuSection } from "./types";

// Always present: account safety and app settings.
export const COMMON_SECTION: MenuSection = {
  key: "settings",
  items: [item("notifSettings", "sliders", "/settings/notifications"), item("security", "shield", "/security"), item("lock", "lock", "/settings/security-lock"), item("storage", "database", "/settings/storage")],
};
