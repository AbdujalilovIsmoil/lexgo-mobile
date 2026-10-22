import type { DocTemplate } from "./match";

// One catalogue row, reduced to what the app shows. Every row of /document-templates carries the whole template (its fields and its full text, ≈15 KB),
// and the catalogue is ≈1000 of them: only these few properties are kept. A worklet so that it can run — with the JSON parsing — on a worker
// runtime; on the JS thread it is an ordinary function. Self-contained on purpose (a worklet cannot use the app's helpers).
export function slimTemplate(d: Record<string, unknown>): DocTemplate {
  "worklet";
  const str = (v: unknown): string => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");
  const num = (v: unknown): number => { const n = typeof v === "string" ? Number(v) : v; return typeof n === "number" && isFinite(n) ? n : 0; };
  const source = str(d.source_file_name);
  // The name is the `title`; an empty one falls back to the source file's name without the extension — never the UUID.
  const name = (str(d.title ?? d.name).trim() || source.replace(/\.[A-Za-z0-9]{1,8}$/, "").trim());
  return {
    id: str(d.id),
    name,
    category: str(d.category),
    language: str(d.language),
    description: str(d.description).trim(),
    fields: Array.isArray(d.fields) ? d.fields.length : 0,
    sections: Array.isArray(d.sections) ? d.sections.length : 0,
    price: num(d.price),
    updatedAt: str(d.updated_at ?? d.published_at),
    sourceFile: source,
    hasSource: d.has_source_file === true || source !== "",
  };
}

// The whole answer text → slim rows (an array, or an object holding one under templates / items / data). Runs on a worker runtime.
export function slimTemplates(text: string): DocTemplate[] {
  "worklet";
  const data = JSON.parse(text) as unknown;
  const list: unknown[] = Array.isArray(data) ? data : ((): unknown[] => {
    const o = (data ?? {}) as Record<string, unknown>;
    for (const k of ["templates", "items", "data"]) if (Array.isArray(o[k])) return o[k] as unknown[];
    return [];
  })();
  const out: DocTemplate[] = [];
  for (let i = 0; i < list.length; i++) {
    const row = slimTemplate((list[i] ?? {}) as Record<string, unknown>);
    if (row.id && row.name) out.push(row);
  }
  return out;
}
