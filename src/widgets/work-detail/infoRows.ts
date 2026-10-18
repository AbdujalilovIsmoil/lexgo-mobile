import { humanizeSlug, fmtDate, fmtDateTime } from "@/shared/lib/format";
import type { Fact } from "@/shared/ui/admin";
import type { InfoKey, WorkDetail } from "@/entities/work";

type T = (key: string, p?: Record<string, string | number>) => string;
const ORDER: InfoKey[] = ["need", "service", "docType", "fileName", "channel", "preferredTime", "region", "minutes", "result", "statusNote", "caseNumber", "stage", "description", "deadline"];

const tr = (t: T, key: string, raw: string) => (t(key) !== key ? t(key) : humanizeSlug(raw));

// Label/value rows of the facts a work carries. Only values the backend sent are listed.
export function infoRows(d: WorkDetail, t: T, locale: string, status: (s: string) => string): Fact[] {
  const fmt = (k: InfoKey, v: string): string =>
    k === "channel" ? tr(t, `cl4.channel.${v}`, v)
    : k === "region" ? tr(t, `lawyers.regions.${v}`, v)
    : k === "minutes" ? `${v} ${t("common.minutesShort")}`
    : k === "deadline" ? fmtDate(v, locale)
    : k === "stage" ? status(v)
    : v;
  const rows = ORDER.filter((k) => d.info[k]).map((k) => ({ label: t(`cl4.info.${k}`), value: fmt(k, d.info[k] ?? "") }));
  return [
    { label: t("cl4.facts.workId"), value: d.work.workId },
    { label: t("cl4.facts.created"), value: fmtDateTime(d.work.createdAt, locale) },
    { label: t("cl4.facts.updated"), value: d.work.updatedAt !== d.work.createdAt ? fmtDateTime(d.work.updatedAt, locale) : "" },
    ...rows,
  ];
}
