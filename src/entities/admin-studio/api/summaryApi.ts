import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import type { EntityCard, StudioSummary } from "../model/typesSummary";

const nums = (v: unknown): Record<string, number> => Object.fromEntries(Object.entries(asDict(v)).map(([k, n]) => [k, asNum(n, 0)]));

function card(raw: unknown): EntityCard {
  const d = asDict(raw);
  return {
    key: asStr(d.key),
    title: asStr(d.title),
    code: asStr(d.constructor_code),
    total: asNum(d.total, 0),
    active: asNum(d.active_count, 0),
    inactive: asNum(d.inactive_count, 0),
    incomplete: asNum(d.incomplete_count, 0),
    studioObjects: asNum(d.studio_object_count, 0),
    listUrl: asStr(d.list_url),
    incompleteUrl: asStr(d.incomplete_url),
    createUrl: asStr(d.create_url),
  };
}

export async function getSummary(): Promise<StudioSummary> {
  const d = asDict(await http("/studio/objects/summary"));
  const perCode: Record<string, number> = {};
  const byCode: Record<string, Record<string, number>> = {};
  for (const x of asArr(d.by_constructor_detail)) {
    const r = asDict(x);
    const code = asStr(r.constructor_code);
    if (code) byCode[code] = nums(r.by_status);
    if (code) perCode[code] = Math.max(asNum(r.total, 0) - asNum(asDict(r.by_status).archived, 0), 0);
  }
  return {
    total: asNum(d.total, 0),
    activeTotal: asNum(d.active_total, 0),
    incompleteTotal: asNum(d.incomplete_total, 0),
    byStatus: nums(d.by_status),
    perCode,
    byCode,
    cards: asArr(d.entity_cards).map(card).filter((c) => c.key && c.code),
  };
}
