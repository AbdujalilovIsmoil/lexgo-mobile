// The lead board lives under two prefixes with the same payloads: /admin/leads (leads.manage) and
// /call-center/leads (call-center staff). Screens pick one; delete / re-engage exist only under /admin.
export type LeadScope = "admin" | "cc";
export const leadsBase = (scope: LeadScope): string => (scope === "cc" ? "/call-center/leads" : "/admin/leads");
