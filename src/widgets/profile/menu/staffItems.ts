import { item, type MenuSection } from "./types";

export const CC_SECTIONS: MenuSection[] = [
  { key: "cc", items: [item("ccCalls", "phone", "/cc/calls"), item("ccComplaints", "alert-triangle", "/cc/complaints"), item("ccNotify", "send", "/cc/notify"), item("ccUrgent", "zap", "/cc/urgent"), item("messages", "message-circle", "/(tabs)/messages")] },
];

export const STAFF_SECTIONS: MenuSection[] = [
  { key: "staff", items: [item("manage", "sliders", "/(tabs)/admin"), item("hrm", "users", "/manage/internal"), item("studio", "edit-3", "/manage/studio"), item("support", "headphones", "/manage/support", "support")] },
];

// Always present: account safety and app settings.
export const COMMON_SECTION: MenuSection = {
  key: "settings",
  items: [item("notifSettings", "sliders", "/settings/notifications"), item("security", "shield", "/security"), item("lock", "lock", "/settings/security-lock"), item("storage", "database", "/settings/storage")],
};
