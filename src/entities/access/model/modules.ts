import type { Access } from "./access";
import { ADM_MODULES } from "./modulesAdm";
import type { AdminModule } from "./moduleTypes";

export { GROUP_ORDER, type AdminModule, type GroupKey } from "./moduleTypes";

// Admin of everything the web panel has. Rules mirror law-main AdminShell:
// an item with a permission needs it (superadmin bypasses); an item without one is
// for admin/superadmin only. Every admin screen also needs staff access (`a.admin`).
const CORE_MODULES: AdminModule[] = [
  { key: "dash", group: "command", icon: "grid", color: "#3B82F6", visible: (a) => a.admin && a.can() },
  { key: "ceo", group: "command", icon: "target", color: "#8B5CF6", visible: (a) => a.admin && a.can() },
  { key: "pipeline", group: "sales", icon: "trending-up", color: "#06B6D4", visible: (a) => a.admin && a.can("leads.manage") },
  { key: "callcenter", group: "sales", icon: "phone", color: "#22C55E", visible: (a) => a.admin && a.can(["leads.manage", "callcenter.access"]) },
  { key: "meetings", group: "sales", icon: "video", color: "#EC4899", visible: (a) => a.canCalls || (a.admin && a.can(["leads.manage", "callcenter.access"])) },
  { key: "callAnalytics", group: "sales", icon: "bar-chart-2", color: "#3B82F6", visible: (a) => a.admin && a.can("leads.manage") },
  { key: "retention", group: "sales", icon: "users", color: "#F59E0B", visible: (a) => a.admin && a.can("leads.manage") },
  { key: "b2b", group: "sales", icon: "briefcase", color: "#64748B", visible: (a) => a.admin && a.can("b2b.manage") },
  { key: "marketplace", group: "catalog", icon: "shopping-bag", color: "#3B82F6", visible: (a) => a.admin && a.can("orders.manage") },
  { key: "services", group: "catalog", icon: "layers", color: "#8B5CF6", visible: (a) => a.admin && a.can("services.manage") },
  { key: "plans", group: "catalog", icon: "star", color: "#F59E0B", visible: (a) => a.admin && a.can("subscriptions.manage") },
  { key: "templates", group: "catalog", icon: "file-text", color: "#06B6D4", visible: (a) => a.admin && a.can("templates.manage") },
  { key: "ads", group: "catalog", icon: "radio", color: "#EC4899", visible: (a) => a.admin && a.can("ads.manage") },
  { key: "studio", group: "studio", icon: "edit-3", color: "#8B5CF6", visible: (a) => a.studioRole },
  { key: "registerRequests", group: "sellers", icon: "user-plus", color: "#22C55E", visible: (a) => a.admin && a.can("users.manage") },
  { key: "reviews", group: "sellers", icon: "message-square", color: "#F59E0B", visible: (a) => a.admin && a.can("lawyers.verify") },
  { key: "payouts", group: "finance", icon: "credit-card", color: "#22C55E", visible: (a) => a.admin && a.can("payments.manage") },
  { key: "approvals", group: "finance", icon: "check-square", color: "#3B82F6", visible: (a) => a.admin && a.can("approvals.manage") },
  { key: "support", group: "support", icon: "headphones", color: "#06B6D4", visible: (a) => a.isSuper || a.callCenter },
  { key: "legalAid", group: "support", icon: "life-buoy", color: "#EC4899", visible: (a) => a.admin && a.can("legal_aid.manage") },
  { key: "notifications", group: "support", icon: "bell", color: "#F59E0B", visible: (a) => a.admin && a.can("notifications.manage") },
  { key: "chats", group: "support", icon: "message-circle", color: "#3B82F6", visible: (a) => true },
  { key: "internal", group: "internal", icon: "users", color: "#6366F1", visible: (a) => a.internal },
  { key: "integrations", group: "system", icon: "zap", color: "#F59E0B", visible: (a) => a.admin && a.can() },
  { key: "testOtps", group: "system", icon: "key", color: "#64748B", visible: (a) => a.admin && a.can(), demoOnly: true },
  { key: "roles", group: "system", icon: "lock", color: "#EF4444", visible: (a) => a.admin && a.can("roles.manage") },
  { key: "audit", group: "system", icon: "activity", color: "#64748B", visible: (a) => a.admin && a.can("users.manage") },
  { key: "legal", group: "system", icon: "file", color: "#64748B", visible: (a) => a.admin && a.can("users.manage") },
  { key: "policies", group: "system", icon: "sliders", color: "#8B5CF6", visible: (a) => a.admin && a.can() },
  { key: "aiReglaments", group: "system", icon: "cpu", color: "#06B6D4", visible: (a) => a.admin && a.can() },
];

export const MODULES: AdminModule[] = [...CORE_MODULES, ...ADM_MODULES];
export const moduleByKey = (key: string): AdminModule | undefined => MODULES.find((m) => m.key === key);
export const visibleModules = (a: Access): AdminModule[] => MODULES.filter((m) => m.visible(a));
