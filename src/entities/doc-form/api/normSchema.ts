import { asArr, asDict, asNum, asStr, type Dict } from "@/shared/lib/json";
import { cleanDocTitle } from "@/shared/lib/doc/cleanTitle";
import { normField } from "./normField";
import type { DocSchema, DocSection } from "../model/types";

const byOrder = <T extends { order: number }>(list: T[]): T[] =>
  list.map((x, i) => ({ x, i })).sort((a, b) => a.x.order - b.x.order || a.i - b.i).map(({ x }) => x);
const keyOf = (d: Dict) => asStr(d.key) || asStr(d.name);

// Sections come from the backend (`section_order`, `field_order`), never guessed
// from names. Fields that no section lists fall into trailing section(s).
export function buildSections(rawSections: unknown, rawFlat: unknown, extraTitle: string): DocSection[] {
  const sections = byOrder(
    asArr(rawSections).map((s, i) => {
      const d = asDict(s);
      const fields = byOrder(asArr(d.fields).map((f, j) => normField(f, j)));
      return { id: asStr(d.id) || `s${i}`, title: asStr(d.title), order: asNum(d.order ?? d.section_order, i + 1), fields };
    }),
  ).filter((s) => s.fields.length);
  const seen = new Set(sections.flatMap((s) => s.fields.map((f) => f.key)));
  const groups = new Map<string, DocSection>();
  asArr(rawFlat).forEach((raw, i) => {
    const d = asDict(raw);
    if (!keyOf(d) || seen.has(keyOf(d))) return;
    const id = sections.length ? "extra" : asStr(d.section_id) || "main";
    const title = sections.length ? extraTitle : asStr(d.section_title) || extraTitle;
    const g = groups.get(id) ?? { id, title, order: asNum(d.section_order, 1000 + groups.size), fields: [] };
    g.fields.push(normField(d, i));
    groups.set(id, g);
  });
  const rest = [...groups.values()].map((g) => ({ ...g, fields: byOrder(g.fields) }));
  return [...sections, ...byOrder(rest)];
}

export function normSchema(v: unknown, serviceId: string, extraTitle: string): DocSchema {
  const d = asDict(v);
  const sections = buildSections(d.sections, d.fields, extraTitle);
  const flat = sections.flatMap((s) => s.fields);
  return {
    serviceId: asStr(d.service_id, serviceId),
    templateId: asStr(d.template_id),
    title: cleanDocTitle(asStr(d.title)),
    sections,
    requiredCount: asNum(d.required_count, flat.filter((f) => f.required).length),
    hasSourceFile: Boolean(d.has_source_file),
    sourceFileName: asStr(d.source_file_name),
    aiFlow: Boolean(d.ai_flow),
    lawyerFlow: Boolean(d.lawyer_flow),
  };
}
