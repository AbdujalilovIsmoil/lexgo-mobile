import { downloadAndShare } from "@/shared/lib/files";
import type { ExportDef, ExportQuery } from "../model/types";

export const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

// "/admin/payouts/export.xlsx" + a period and a filter → the request path.
export function exportPath(def: ExportDef, q: ExportQuery): string {
  const p = new URLSearchParams();
  if (def.dates && q.from) p.set("date_from", q.from);
  if (def.dates && q.to) p.set("date_to", q.to);
  if (def.filter && q.filter) p.set(def.filter.param, q.filter);
  return p.size ? `${def.path}?${p}` : def.path;
}

export const exportFileName = (def: ExportDef, q: ExportQuery): string =>
  `lexgo-${def.key}${q.from || q.to ? `-${q.from || "start"}_${q.to || "now"}` : ""}${def.filter && q.filter ? `-${q.filter}` : ""}.xlsx`;

// Downloads the workbook (bearer token) and opens the system share sheet (save to Files, send…).
export const runExport = (def: ExportDef, q: ExportQuery) => downloadAndShare(exportPath(def, q), exportFileName(def, q), XLSX);
