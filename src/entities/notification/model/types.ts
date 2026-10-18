import type { Dict } from "@/shared/lib/json";

export type NotifCategory = "orders" | "payments" | "chat" | "documents" | "system" | "marketing";
export const NOTIF_CATEGORIES: NotifCategory[] = ["orders", "payments", "chat", "documents", "system", "marketing"];

// One inbox item. The backend stores a row per delivery channel; after folding,
// `ids` lists every row of the event and `channels` where it was delivered.
// `entityType` / `entityId` / `deepLink` are the TZ 28 payload fields (empty on today's staging rows).
export type Notification = {
  id: string;
  ids: string[];
  title: string;
  body: string;
  category: NotifCategory;
  event: string;
  channels: string[];
  data: Dict;
  entityType: string;
  entityId: string;
  deepLink: string;
  read: boolean;
  createdAt: string;
};

export const CATEGORY_ICON: Record<NotifCategory, string> = {
  orders: "shopping-bag",
  payments: "credit-card",
  chat: "message-circle",
  documents: "file-text",
  system: "bell",
  marketing: "gift",
};

export const CATEGORY_COLOR: Record<NotifCategory, string> = {
  orders: "#3B82F6",
  payments: "#22C55E",
  chat: "#06B6D4",
  documents: "#8B5CF6",
  system: "#64748B",
  marketing: "#F59E0B",
};
