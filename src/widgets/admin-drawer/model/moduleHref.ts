import type { Access } from "@/entities/access";

// A sales operator has the funnel, the duty desk, meetings and call analytics as tabs (tabConfig `sales`): those modules open their tab, so the
// same screen never runs twice (once as a tab, once in the admin stack).
const SALES_TABS: Record<string, string> = { pipeline: "/(tabs)/pipeline", callcenter: "/(tabs)/duty", meetings: "/(tabs)/smeetings", callAnalytics: "/(tabs)/canalytics" };

export const moduleHref = (key: string, a: Pick<Access, "salesOperator">): string => (a.salesOperator && SALES_TABS[key]) || `/manage/${key}`;
