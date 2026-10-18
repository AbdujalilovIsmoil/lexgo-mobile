// Query keys. Everything under "notifications" is persisted (shared/cache persistRules).
export const notificationKeys = {
  all: ["notifications"] as const,
  list: ["notifications", "list"] as const,
  unread: ["notifications", "unread"] as const,
  prefs: ["notification-prefs"] as const,
};
