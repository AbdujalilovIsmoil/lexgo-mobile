// Catalogue titles come from DOCX file names (law-main/lib/docTitle.ts): drop
// the draft underscore, double spaces, a ".docx" tail and the filename's dot.
const EXT = /\.(docx?|pdf|rtf|odt|txt)$/i;
const UUID = /^\{?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\}?$/i;

export function cleanDocTitle(raw: string): string {
  let s = (raw || "").trim().replace(/^[_\s]+/, "").replace(/[\s ]+/g, " ").trim();
  s = s.replace(EXT, "");
  if (UUID.test(s)) return "";
  return s.replace(/([^\s.…]{3,})\.$/, "$1").trim();
}
