import { answerText, generateDoc as generateRequest, previewAnswers, saveAnswers, type DocField as MyField, type MyDoc } from "@/entities/my-document";
import { toWire, type DocField, type DocPreview, type DocSchema, type DocSection, type FillSource, type GeneratedDoc } from "@/entities/doc-form";

const byOrder = <T extends { order: number }>(l: T[]): T[] => l.map((x, i) => ({ x, i })).sort((a, b) => a.x.order - b.x.order || a.i - b.i).map(({ x }) => x);

const toField = (f: MyField): DocField => ({ key: f.name, label: f.label, type: f.type, required: f.required, placeholder: f.placeholder || undefined, options: f.options, order: f.order });

// The section schema from the request's own (flat) questionnaire: the fallback when the template's render answered no sections. Sections keep the
// backend's order (`sectionOrder`, then `order`); fields that name no section share one.
export function schemaFromDoc(doc: MyDoc, o: { templateId: string; title: string; extraTitle: string }): DocSchema {
  const groups = new Map<string, DocSection & { at: number }>();
  doc.fields.forEach((f, i) => {
    const id = f.section || "main";
    const g = groups.get(id) ?? { id, title: f.section ? f.section : o.extraTitle, order: f.sectionOrder || 1000 + groups.size, fields: [], at: i };
    g.fields.push(toField(f));
    groups.set(id, g);
  });
  const sections = byOrder([...groups.values()]).map(({ id, title, order, fields }) => ({ id, title, order, fields: byOrder(fields) }));
  return { serviceId: "", templateId: o.templateId, title: o.title, sections, requiredCount: sections.flatMap((s) => s.fields).filter((f) => f.required).length, hasSourceFile: false, sourceFileName: "", aiFlow: false, lawyerFlow: false };
}

// What the server holds, as the form's strings (only the schema's fields).
export const serverAnswers = (doc: Pick<MyDoc, "answers">, fields: DocField[]): Record<string, string> =>
  Object.fromEntries(fields.map((f) => [f.key, answerText(doc.answers, f.key)]).filter(([, v]) => v));

// The server's answers with the local draft's non-empty ones on top (the draft is the newer typing; the server may hold answers the draft never had).
export function mergeAnswers(server: Record<string, string>, local: Record<string, string> | undefined): Record<string, string> {
  const out = { ...server };
  for (const [k, v] of Object.entries(local ?? {})) if (v.trim()) out[k] = v;
  return out;
}

// The finished request as the wizard's result: the file is the request's own (`/document-requests/{id}/file`, fetched with the token).
export const docToGenerated = (d: MyDoc): GeneratedDoc => ({
  requestId: d.id,
  workId: d.workId,
  title: d.title,
  status: d.status,
  paid: d.paid || !d.requiresPayment,
  price: d.price,
  mode: d.mode,
  file: d.file ? { name: d.file.name, mime: d.file.mime, path: d.file.path, format: d.format || "docx" } : null,
});

const toPreview = (p: Awaited<ReturnType<typeof previewAnswers>>): DocPreview => ({ text: p.text, canGenerate: p.canGenerate, percent: p.percent, missing: p.missing.map((m) => ({ key: m.name, label: m.label })) });

// A template with no linked service filled through its document request: preview, autosave and generate all go to /document-requests/{id}.
export function requestSource(o: { requestId: string; templateId: string; fields: DocField[]; answers: Record<string, string>; meta?: FillSource["meta"] }): FillSource {
  const id = o.requestId;
  return {
    draftId: o.templateId,
    draftMode: "tpl",
    previewKey: `req:${id}`,
    requestId: id,
    serverWire: toWire(o.fields, o.answers),
    meta: o.meta,
    preview: async (wire) => toPreview(await previewAnswers(id, wire)),
    save: async (wire) => { await saveAnswers(id, wire); },
    generate: async (wire) => {
      await saveAnswers(id, wire); // the backend builds from what it holds: the full current answers first
      return docToGenerated(await generateRequest(id));
    },
  };
}
