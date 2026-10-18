import type { Issue } from "@/entities/admin-policies";

type T = (key: string, p?: Record<string, string | number>) => string;

// Field name for a validation path such as "exp.1.minYears" or "seller.ratingMin".
export function fieldName(path: string, t: T): string {
  const [a, b, c] = path.split(".");
  if (path === "minPercent") return t("admPolC.pr.min");
  if (path === "maxPercent") return t("admPolC.pr.max");
  if (a === "exp" && c) return t("admPolC.pr.rowField", { row: Number(b) + 1, field: t(c === "minYears" ? "admPolC.pr.from" : c === "maxYears" ? "admPolC.pr.to" : "admPolC.pr.premium") });
  if (a === "regions" && c) return t("admPolC.pr.rowField", { row: Number(b) + 1, field: t(c === "key" ? "admPolC.pr.regKey" : "admPolC.pr.coef") });
  const k = `admPolC.pr.${a}.${b}`;
  return b && t(k) !== k ? t(k) : path;
}

export const issueText = (i: Issue, t: T) => t(`admPolC.pr.issue.${i.code}`, { field: fieldName(i.path, t), ...i.params });
