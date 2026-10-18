const EXT = /\.(docx?|pdf|rtf|odt|txt)$/i;
const UUID_ONLY = /^\{?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\}?$/i;

// Catalogue titles are imported from file names: strip the leading "_", double spaces,
// the file extension and the trailing full stop (same rules as the web's cleanDocTitle).
export function cleanTitle(raw: string): string {
  let s = (raw || "").trim().replace(/^[_\s]+/, "").replace(/[\s ]+/g, " ").replace(EXT, "").trim();
  if (UUID_ONLY.test(s)) return "";
  s = s.replace(/([^\s.…]{3,})\.$/, "$1");
  return s.trim();
}
