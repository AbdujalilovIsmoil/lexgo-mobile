// §18: PDF, DOC, DOCX, JPEG, PNG and WebP, up to 20 MB each. Checked on the phone before anything is uploaded, so a file the server
// would refuse never travels in full first. Only the experience form uses this; other features keep their own rules.
export const EVIDENCE_MAX_MB = 20;
export const EVIDENCE_EXTS = /\.(pdf|docx?|jpe?g|png|webp)$/i;
export const EVIDENCE_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png", "image/webp"];
const GENERIC = new Set(["", "application/octet-stream", "binary/octet-stream"]);

type Candidate = { name: string; mime?: string; size: number };
export type EvidenceVerdict<T> = { ok: T[]; badType: T[]; tooBig: T[] };

// A name and a stated type that both say "allowed" (a picker may ignore its filter, or hand over a GIF named .jpg); an unknown size (0) passes.
export function checkEvidence<T extends Candidate>(files: T[]): EvidenceVerdict<T> {
  const out: EvidenceVerdict<T> = { ok: [], badType: [], tooBig: [] };
  for (const f of files) {
    const mime = (f.mime ?? "").toLowerCase().split(";")[0].trim();
    if (!EVIDENCE_EXTS.test(f.name) || (!GENERIC.has(mime) && !EVIDENCE_TYPES.includes(mime))) out.badType.push(f);
    else if (f.size > EVIDENCE_MAX_MB * 1024 * 1024) out.tooBig.push(f);
    else out.ok.push(f);
  }
  return out;
}
