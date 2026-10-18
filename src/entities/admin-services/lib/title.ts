// Titles come from imported DOCX file names: drop the leading "_", the file extension, a trailing full stop and double spaces.
export function cleanTitle(raw: string): string {
  return raw.replace(/^[_\s]+/, "").replace(/\.(docx?|pdf|rtf|odt|txt)$/i, "").replace(/\s+/g, " ").replace(/\.$/, "").trim();
}
