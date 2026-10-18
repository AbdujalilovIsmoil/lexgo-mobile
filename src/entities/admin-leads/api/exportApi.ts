import { downloadAndShare } from "@/shared/lib/files";
import { leadsBase, type LeadScope } from "./scope";

const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

// GET …/leads/kanban/export.xlsx — the whole board as a spreadsheet, handed to the share sheet.
export const exportBoard = (scope: LeadScope): Promise<void> => downloadAndShare(`${leadsBase(scope)}/kanban/export.xlsx`, "lexgo-leads.xlsx", XLSX);
