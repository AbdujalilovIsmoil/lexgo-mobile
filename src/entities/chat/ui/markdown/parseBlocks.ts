export type Block =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "li"; mark: string; text: string }
  | { kind: "quote"; text: string }
  | { kind: "hr" }
  | { kind: "lead"; label: string; text: string }
  | { kind: "note"; text: string }
  | { kind: "footer"; text: string }
  | { kind: "followups"; title: string; items: string[] };

const NUM = /^\s*(\d{1,2}[.)])\s+(.*)$/;
const BUL = /^\s*[-*•]\s+(.*)$/;
const QUO = /^\s*>\s?(.*)$/;
const HEAD = /^\s*#{1,4}\s+(.*)$/;
const HR = /^\s*([-*_])\1{2,}\s*$/;

// The shapes LexGo.AI answers use: bold titles, numbered / bulleted lists, quotes, italic notes.
export function parseBlocks(text: string): Block[] {
  const out: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) out.push({ kind: "p", text: para.join("\n") });
    para = [];
  };
  const push = (b: Block) => {
    flush();
    out.push(b);
  };
  for (const line of text.replace(/\r/g, "").split("\n")) {
    const head = line.match(HEAD);
    const quote = line.match(QUO);
    const num = line.match(NUM);
    const bul = line.match(BUL);
    const last = out[out.length - 1];
    if (!line.trim()) flush();
    else if (HR.test(line)) push({ kind: "hr" });
    else if (head) push({ kind: "h", text: head[1] });
    else if (quote && para.length === 0 && last?.kind === "quote") last.text += `\n${quote[1]}`;
    else if (quote) push({ kind: "quote", text: quote[1] });
    else if (num) push({ kind: "li", mark: num[1], text: num[2] });
    else if (bul) push({ kind: "li", mark: "•", text: bul[1] });
    else para.push(line.trim());
  }
  flush();
  return out;
}
