import { auditCsvPath, type AuditFilters } from "@/entities/admin-audit";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { downloadAndShare } from "@/shared/lib/files";

// CSV of the filtered log (GET /admin/audit-trail?export=csv, users.manage) into the share sheet.
// The backend writes an audit record for every export.
export const useAuditExport = () =>
  useAdminMutation({ mutationFn: (f: AuditFilters) => downloadAndShare(auditCsvPath(f), "lexgo-audit-trail.csv", "text/csv") });
