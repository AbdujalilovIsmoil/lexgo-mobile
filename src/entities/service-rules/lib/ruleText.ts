// A rule body as readable paragraphs. The backend sends plain text or HTML (<p>, <br>, lists, links …): tags become line breaks
// and "• " / "1. " items, entities are decoded, scripts and styles are dropped. It is never rendered as markup (web svr-body).
const TAG = /<\/?[a-z][^>]*>/i;
const DROP = /<(script|style|template|noscript|iframe|object|embed|svg|math|title|head|textarea|select)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;
const BLOCK = new Set(["p", "div", "section", "article", "header", "footer", "blockquote", "pre", "h1", "h2", "h3", "h4", "h5", "h6", "table", "hr"]);
const ENT: Record<string, string> = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", laquo: "«", raquo: "»", ldquo: "“", rdquo: "”", bdquo: "„", lsquo: "‘", rsquo: "’",
  mdash: "—", ndash: "–", hellip: "…", bull: "•", middot: "·", sect: "§", copy: "©", reg: "®", trade: "™", times: "×", deg: "°", shy: "",
};

export const decodeEntities = (s: string): string =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] !== "#") return ENT[e.toLowerCase()] ?? m;
    const n = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
    return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : m;
  });

const hrefOf = (attrs: string): string => {
  const v = /\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs);
  const url = decodeEntities((v?.[2] ?? v?.[3] ?? v?.[4] ?? "").trim());
  return /^(https:\/\/|mailto:)/i.test(url) ? url : "";
};

function htmlToText(html: string): string {
  const src = html.replace(/<!--[\s\S]*?-->/g, "").replace(DROP, "");
  const lists: { ordered: boolean; n: number }[] = [];
  const links: { href: string; at: number }[] = [];
  const re = /<(\/?)([a-z][a-z0-9]*)\b([^>]*)>/gi;
  let out = "";
  let last = 0;
  for (let m = re.exec(src); m; m = re.exec(src)) {
    out += src.slice(last, m.index).replace(/\s+/g, " ");
    last = re.lastIndex;
    const close = m[1] === "/";
    const tag = m[2].toLowerCase();
    if (tag === "br") out += "\n";
    else if (tag === "ul" || tag === "ol") {
      if (close) lists.pop();
      else lists.push({ ordered: tag === "ol", n: 0 });
      out += "\n\n";
    } else if (tag === "li" && !close) {
      const l = lists[lists.length - 1];
      out += `\n${l?.ordered ? `${++l.n}.` : "•"} `; // one list stays one paragraph: an item only starts a new line
    } else if (tag === "tr") out += "\n";
    else if (tag === "td" || tag === "th") out += close ? "" : " ";
    else if (BLOCK.has(tag)) out += "\n\n";
    else if (tag === "a" && !close) links.push({ href: hrefOf(m[3]), at: out.length });
    else if (tag === "a") {
      // A link keeps its words; the address follows when the words do not already show it (the text stays selectable).
      const a = links.pop();
      const words = a ? decodeEntities(out.slice(a.at)).trim() : "";
      if (a?.href && words !== a.href && words !== a.href.replace(/^mailto:/i, "")) out += ` (${a.href})`;
    }
  }
  return decodeEntities(out + src.slice(last).replace(/\s+/g, " "));
}

// Paragraphs to show: blank lines split them, line breaks inside one are kept, empty ones are dropped.
export function ruleParagraphs(body: string): string[] {
  const src = body.replace(/\r\n?/g, "\n").trim();
  if (!src) return [];
  const text = TAG.test(src) ? htmlToText(src) : src;
  return text
    .split(/\n\s*\n/)
    .map((p) => p.split("\n").map((l) => l.replace(/[ \t]+/g, " ").trim()).filter(Boolean).join("\n"))
    .filter(Boolean);
}
