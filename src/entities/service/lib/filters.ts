import { normalizeSearchText } from "@/shared/lib/searchText";
import type { Service } from "../model/types";

export type DocFilter = "all" | "template" | "lawyer";
export type PriceFilter = "all" | "free" | "low" | "mid" | "high";
export type ExecFilter = "all" | "ai" | "yurist" | "advokat";
export type SvcSort = "rel" | "az" | "cheap" | "doc";
export type DirSize = "all" | "big" | "mid" | "small";
export type SubSort = "count" | "countAsc" | "name";

export const DOC_VALUES: DocFilter[] = ["all", "template", "lawyer"];
export const PRICE_VALUES: PriceFilter[] = ["all", "free", "low", "mid", "high"];
export const EXEC_VALUES: ExecFilter[] = ["all", "ai", "yurist", "advokat"];
export const SVCSORT_VALUES: SvcSort[] = ["rel", "az", "cheap", "doc"];
export const DIRSIZE_VALUES: DirSize[] = ["all", "big", "mid", "small"];
export const SUBSORT_VALUES: SubSort[] = ["count", "countAsc", "name"];

const PRICE_LOW = 300_000;
const PRICE_MID = 1_000_000;

export const inDoc = (s: Service, v: DocFilter) => (v === "all" ? true : v === "template" ? !!s.documentTemplateId : !s.documentTemplateId);

export function inPrice(s: Service, v: PriceFilter): boolean {
  if (v === "all") return true;
  const p = s.price ?? 0;
  if (v === "free") return !p;
  if (v === "low") return p > 0 && p <= PRICE_LOW;
  if (v === "mid") return p > PRICE_LOW && p <= PRICE_MID;
  return p > PRICE_MID;
}

// executor_type arrives in two scripts and many spellings; three buckets divide it.
// advokat_required wins outright (it is the flag behind the "With an advocate" ribbon).
export function execBucket(s: Service): Exclude<ExecFilter, "all"> {
  if (s.advokatRequired) return "advokat";
  const n = normalizeSearchText(s.executorType || "");
  if (/(?:^| )ai(?: |$)/.test(n)) return "ai";
  if (n.includes("advokat") && !n.includes("yurist")) return "advokat";
  if (n.includes("yurist") || n.includes("lawyer")) return "yurist";
  return "ai";
}

export const inExec = (s: Service, v: ExecFilter) => v === "all" || execBucket(s) === v;
export const sizeOf = (n: number): Exclude<DirSize, "all"> => (n >= 20 ? "big" : n >= 5 ? "mid" : "small");
export const inSize = (n: number, v: DirSize) => v === "all" || sizeOf(n) === v;

export function sortServices(rows: Service[], sort: SvcSort, locale: string): Service[] {
  const by = (a: Service, b: Service) => a.name.localeCompare(b.name, locale);
  if (sort === "az") return [...rows].sort(by);
  if (sort === "cheap") return [...rows].sort((a, b) => (a.price ?? 0) - (b.price ?? 0) || by(a, b));
  if (sort === "doc") return [...rows].sort((a, b) => Number(!!b.documentTemplateId) - Number(!!a.documentTemplateId) || by(a, b));
  return rows;
}
