import type { UploadRule } from "../model/types";

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
};

type PickRule = { maxMb: number; exts: RegExp; types?: string[]; label: string };

// What a picker and its check need from a rule: the extensions, the system picker's types (only when every format has a known one —
// an unknown type would grey that file out) and the list as people read it ("PDF, DOC, DOCX").
export function pickRule(r: UploadRule): PickRule {
  const exts = r.formats.map((f) => f.toLowerCase().replace(/[^a-z0-9]/g, "")).filter(Boolean);
  const types = exts.map((f) => MIME[f]);
  return { maxMb: r.mb, exts: new RegExp(`\\.(${exts.join("|")})$`, "i"), types: types.every(Boolean) ? types : undefined, label: exts.map((f) => f.toUpperCase()).join(", ") };
}
