const EXT = /\.(docx?|pdf|txt|odt|rtf)$/i;
const UUID_ONLY = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Catalogue titles carry file-name leftovers ("_Ariza.docx", double spaces, a bare UUID).
export function cleanTitle(raw: string): string {
  let s = (raw || "").replace(/^[_\s]+/, "").replace(/[\s ]+/g, " ").trim().replace(EXT, "");
  if (UUID_ONLY.test(s)) return "";
  s = s.replace(/([^\s.…]{3,})\.$/, "$1");
  return s.trim();
}

// File name for a download: the document's title + the real extension, never an id.
export function docFileName(title: string, format: string, fallback: string): string {
  const base = (cleanTitle(title) || fallback).replace(/[\\/:*?"<>|]+/g, " ").slice(0, 80).trim();
  return `${base || fallback}.${(format || "docx").replace(/^\./, "")}`;
}
