import type { DocFile, DocReq } from "../model/types";
import type { docCan } from "../model/can";
import { FLOWS, LATE_MS } from "../model/status";

type Can = ReturnType<typeof docCan>;

export type FileEntry = { file: DocFile; role: "final" | "client" | "template" };
// Every file of the request in download order: the finished document, the client's files, the clean template.
export function filesOf(d: DocReq): FileEntry[] {
  const out: FileEntry[] = [];
  if (d.finalFile) out.push({ file: d.finalFile, role: "final" });
  for (const f of d.files) out.push({ file: f, role: "client" });
  if (d.templateFile) out.push({ file: d.templateFile, role: "template" });
  return out.filter((e) => !!e.file.path);
}

// What "Yuklab olish" fetches: the finished file, else the client's first file, else the template; null = nothing yet.
export const mainFile = (d: DocReq): FileEntry | null => filesOf(d)[0] ?? null;

export type SheetAction = "claim" | "editor" | "transfer" | null;
// The one contextual action, by what the backend allows: take it, open the editor, or hand it over.
export const actionOf = (can: Can): SheetAction => (can.claim ? "claim" : can.editor ? "editor" : can.transfer ? "transfer" : null);

export type FactKey = "client" | "type" | "service" | "assigned" | "created" | "updated" | "language" | "waiting" | "files";
export type Fact = { key: FactKey; text?: string; iso?: string; n?: number; late?: boolean };

// The key-facts grid: only what the backend sent. "waiting" = an unfinished request nobody closed yet, flagged late after 24 h.
export function factsOf(d: DocReq, now: number = Date.now()): Fact[] {
  const open = ["open_pool", "new", "claimed", "pending_payment"].includes(d.status);
  const born = Date.parse(d.createdAt);
  const upd = Date.parse(d.updatedAt);
  const files = filesOf(d).length;
  const out: (Fact | null)[] = [
    d.clientName ? { key: "client", text: d.clientName } : null,
    d.requestedType ? { key: "type", text: d.requestedType } : null,
    d.serviceName ? { key: "service", text: d.serviceName } : null,
    d.assignedName ? { key: "assigned", text: d.assignedName } : null,
    d.createdAt ? { key: "created", iso: d.createdAt } : null,
    d.updatedAt && upd - born > 60_000 ? { key: "updated", iso: d.updatedAt } : null,
    d.language ? { key: "language", text: d.language.toUpperCase() } : null,
    open && born ? { key: "waiting", iso: d.createdAt, late: now - born > LATE_MS } : null,
    files ? { key: "files", n: files } : null,
  ];
  return out.filter((f): f is Fact => !!f);
}

// Status-tab counts from the "all" list (open pool items live in the pool, not here).
export function tabCounts(rows: DocReq[]): Record<string, number> {
  const c: Record<string, number> = { all: rows.length };
  for (const r of rows) c[r.status] = (c[r.status] ?? 0) + 1;
  return c;
}

export type DocChip = { key: "flow" | "sort"; label: string };
// Filters set from the sheet as removable chips: a work type, and a sort order other than "newest first".
export function filterChips(f: { flow: string; newest: boolean }, names: { flow: (v: string) => string; oldest: string }): DocChip[] {
  const out: DocChip[] = [];
  if (f.flow !== "all" && (FLOWS as readonly string[]).includes(f.flow)) out.push({ key: "flow", label: names.flow(f.flow) });
  if (!f.newest) out.push({ key: "sort", label: names.oldest });
  return out;
}
