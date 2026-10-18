import type { ExportDef } from "./types";

// Studio and Internal HRM exports (their access is not a plain permission code).
export const OPS_EXPORTS: ExportDef[] = [
  { key: "studio", path: "/admin/studio/export.xlsx", icon: "edit-3", visible: (a) => a.studioRole, dates: false },
  { key: "hrm", path: "/internal/analytics/export.xlsx", icon: "users", visible: (a) => a.canInternal("internal_analytics.view"), dates: true },
];
