// Rich text saved by the Studio editors (rule bodies, guarantee texts) as plain readable text: line breaks and list bullets stay,
// every other tag is dropped and entities (&nbsp; &amp; &#39; …) are decoded. It is never rendered as HTML.
const NAMED: Record<string, string> = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", laquo: "«", raquo: "»", ndash: "–", mdash: "—", hellip: "…",
  lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”", bull: "•", middot: "·", shy: "",
};

const decode = (s: string): string =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] !== "#") return NAMED[e.toLowerCase()] ?? m;
    const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : m;
  });

export function htmlText(html: string): string {
  if (!/[<&]/.test(html)) return html.trim(); // plain text stays as written
  const flat = html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "\n• ")
    .replace(/<\/(p|div|h[1-6]|ul|ol|tr|blockquote)>/gi, "\n")
    .replace(/<[^>]*>/g, "");
  return decode(flat)
    .replace(/[ \t ]+/g, " ")
    .split("\n")
    .map((l) => l.trim())
    .join("\n")
    .replace(/\n+(?=• )/g, "\n") // a list starts on the next line, not after a gap
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
