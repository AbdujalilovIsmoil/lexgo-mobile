// A server-supplied file name never decides a path: drop separators, "..",
// control characters and cap the length (TZ 29, path traversal).
export function safeName(name: string, fallback = "file"): string {
  const base = name.split(/[\\/]/).pop() ?? "";
  const clean = base.replace(/[\u0000-\u001f<>:"|?*]+/g, "_").replace(/\.{2,}/g, ".").replace(/^\.+/, "").trim();
  const dot = clean.lastIndexOf(".");
  const stem = (dot > 0 ? clean.slice(0, dot) : clean).slice(0, 80);
  const ext = dot > 0 ? clean.slice(dot).slice(0, 12) : "";
  return stem ? stem + ext : fallback;
}

// Content-Disposition: attachment; filename="a.pdf"; filename*=UTF-8''a%20b.pdf
export function nameFromDisposition(header?: string | null): string | null {
  if (!header) return null;
  const star = /filename\*\s*=\s*[^']*''([^;]+)/i.exec(header);
  if (star) {
    try {
      return safeName(decodeURIComponent(star[1].trim()));
    } catch {
      /* fall through to the plain form */
    }
  }
  const plain = /filename\s*=\s*"?([^";]+)"?/i.exec(header);
  return plain ? safeName(plain[1].trim()) : null;
}

const MIME_EXT: Record<string, string> = { "application/pdf": "pdf", "image/png": "png", "image/jpeg": "jpg", "audio/mpeg": "mp3", "audio/mp4": "m4a", "audio/webm": "webm" };
export const withExt = (name: string, mime?: string | null): string => (name.includes(".") || !mime || !MIME_EXT[mime] ? name : `${name}.${MIME_EXT[mime]}`);
