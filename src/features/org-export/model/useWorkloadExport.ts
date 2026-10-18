import { useState } from "react";
import { File, Paths } from "expo-file-system";
import { listWorkload, type WorkItem } from "@/entities/organization";
import { shareFile } from "@/shared/lib/files";
import { successHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { toCsv } from "../lib/toCsv";

const COLS = ["id", "kind", "title", "status", "payment", "member", "client", "amount", "deadline", "created", "updated"];

// Builds a CSV of the filtered workload (all pages, at most 2000 rows) and opens the share sheet.
// The backend has no owner export endpoint, so the file is made on the phone from the owner API.
export function useWorkloadExport(orgId: string, memberId: string, status: string, nameOf: (id: string) => string) {
  const { t } = useT();
  const [busy, setBusy] = useState(false);
  const run = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const all: WorkItem[] = [];
      for (let offset = 0; offset < 2000; offset += 100) {
        const page = await listWorkload(orgId, { memberId, status, limit: 100, offset });
        all.push(...page.items);
        if (!page.hasMore || !page.items.length) break;
      }
      const file = new File(Paths.cache, `workload-${new Date().toISOString().slice(0, 10)}.csv`);
      file.create({ overwrite: true });
      file.write(toCsv(COLS.map((c) => t(`og8.col.${c}`)), all, nameOf));
      await shareFile(file.uri, "text/csv");
      successHaptic();
    } catch {
      toast(t("og8.exportFailed"), "err");
    } finally {
      setBusy(false);
    }
  };
  return { run, busy };
}
