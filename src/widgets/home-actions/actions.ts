import type { IconName } from "@/shared/ui";

export type QuickAction = { key: string; icon: IconName; colors: [string, string]; href: string; auth?: boolean; label?: string };

// TZ 7 quick actions of the client dashboard. `auth` ones need a signed-in client.
export const ACTIONS: QuickAction[] = [
  { key: "ai", icon: "zap", colors: ["#1668F0", "#00CFE8"], href: "/(tabs)/ai" },
  { key: "docs", icon: "file-plus", colors: ["#00A6E6", "#00CFE8"], href: "/(tabs)/services" },
  { key: "analysis", icon: "search", colors: ["#7A5CFF", "#B7A4FF"], href: "/doc-analysis" },
  { key: "urgent", icon: "phone-call", colors: ["#E0457F", "#FF8DB8"], href: "/urgent", auth: true },
  { key: "market", icon: "users", colors: ["#1668F0", "#5CA8FF"], href: "/(tabs)/lawyers" },
  { key: "support", icon: "headphones", colors: ["#00A870", "#3DDC97"], href: "/support", auth: true },
  { key: "works", icon: "briefcase", colors: ["#C2680A", "#FBC15E"], href: "/(tabs)/works", auth: true },
  { key: "documents", icon: "folder", colors: ["#154CB0", "#2E8BFF"], href: "/documents", auth: true },
  { key: "plans", icon: "credit-card", colors: ["#6A4DFF", "#A98BFF"], href: "/subscription" },
];
