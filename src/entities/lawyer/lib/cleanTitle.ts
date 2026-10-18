// Service titles come from imported file names: drop a leading "_", a trailing
// "." / ".docx", and double spaces (same rules as cleanDocTitle on the web).
export const cleanTitle = (raw: string): string =>
  raw.replace(/\.docx$/i, "").replace(/^[_\s]+/, "").replace(/\s{2,}/g, " ").replace(/\.\s*$/, "").trim();
