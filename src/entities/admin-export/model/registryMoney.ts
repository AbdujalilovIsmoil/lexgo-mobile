import type { ExportDef } from "./types";

const ORDER_STATUS = { param: "status", options: ["pending_payment", "paid", "active", "completed", "cancelled"], i18n: "admSt" };

// Money, catalogue and marketplace exports.
export const MONEY_EXPORTS: ExportDef[] = [
  { key: "payments", path: "/admin/payments/export.xlsx", icon: "credit-card", visible: (a) => a.can("payments.manage"), dates: true },
  { key: "payouts", path: "/admin/payouts/export.xlsx", icon: "dollar-sign", visible: (a) => a.can("payments.manage"), dates: true, filter: { param: "status", options: ["calculated", "queued", "paid", "failed"], i18n: "admSt" } },
  { key: "subscriptions", path: "/admin/subscriptions/export.xlsx", icon: "repeat", visible: (a) => a.can("subscriptions.manage"), dates: true },
  { key: "plans", path: "/admin/subscription-plans/export.xlsx", icon: "star", visible: (a) => a.can("subscriptions.manage"), dates: true },
  { key: "categories", path: "/admin/service-categories/export.xlsx", icon: "layers", visible: (a) => a.can("services.manage"), dates: true },
  { key: "templates", path: "/admin/document-templates/export.xlsx", icon: "file-text", visible: (a) => a.can("templates.manage"), dates: true },
  { key: "orders", path: "/admin/marketplace/orders/export.xlsx", icon: "shopping-bag", visible: (a) => a.can("orders.manage"), dates: true, filter: ORDER_STATUS },
  { key: "sellers", path: "/admin/marketplace/sellers/export.xlsx", icon: "briefcase", visible: (a) => a.can("orders.manage"), dates: true },
  { key: "promotions", path: "/admin/promotions/export.xlsx", icon: "radio", visible: (a) => a.can(["ads.manage", "orders.manage", "sales.access"]), dates: true },
  { key: "leads", path: "/admin/leads/kanban/export.xlsx", icon: "trending-up", visible: (a) => a.can("leads.manage"), dates: true },
];
