import type { Access } from "@/entities/access";

// A sales operator has the funnel, the duty desk and meetings as tabs (tabConfig `sales`): those modules open their tab, so the
// same screen never runs twice (once as a tab, once in the admin stack).
const SALES_TABS: Record<string, string> = { pipeline: "/(tabs)/pipeline", callcenter: "/(tabs)/duty", meetings: "/(tabs)/smeetings" };

export const moduleHref = (key: string, a: Pick<Access, "salesOperator">): string => (a.salesOperator && SALES_TABS[key]) || `/manage/${key}`;
