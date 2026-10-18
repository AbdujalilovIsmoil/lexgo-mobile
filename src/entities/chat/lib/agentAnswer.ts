import type { Block } from "../ui/markdown/parseBlocks";

// Legal-agent answers (web lib/agentAnswer.ts): the Markdown carries a "Qisqa javob" lead, italic notes,
// a closing "Manba…" line and "Aniqroq javob uchun" follow-up questions. The API has no fields for them.
export type AgentKind = "answer" | "not_found" | "lex_unavailable" | "document_request" | "error";

export function classifyAgentAnswer(content: string): AgentKind {
  const s = (content || "").toLowerCase();
  if (/lex\.uz sayti hozir javob bermayapti/.test(s)) return "lex_unavailable";
  if (/^\s*(ai servis bilan aloqa vaqtida xatolik|javob tayyorlashda texnik xatolik)/.test(s)) return "error";
  if (/aniq javob beradigan modda topilmadi/.test(s)) return "not_found";
  if (/hujjat so['ʻ’`]rovi/.test(s)) return "document_request";
  return "answer";
}

const wholeBold = (s: string) => /^\*\*([^*][\s\S]*?)\*\*:?$/.exec(s.trim());
const wholeItalic = (s: string) => /^(?:_([^_][\s\S]*?)_|\*([^*][\s\S]*?)\*)$/.exec(s.trim());

// Parsed blocks → lead / note / footer / follow-ups where the shapes match; everything else is untouched.
export function agentBlocks(blocks: Block[]): Block[] {
  const out: Block[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.kind === "p") {
      const lead = /^\*\*([^*]{1,40}?):?\*\*:?\s*([\s\S]+)$/.exec(b.text);
      const bold = wholeBold(b.text);
      const it = wholeItalic(b.text);
      if (lead && /qisqa javob|xulosa/i.test(lead[1])) { out.push({ kind: "lead", label: lead[1].replace(/:$/, ""), text: lead[2] }); continue; }
      if (it) { const body = (it[1] ?? it[2]).trim(); out.push({ kind: /^manba/i.test(body) ? "footer" : "note", text: body }); continue; }
      if (bold && /aniqroq javob uchun/i.test(bold[1])) {
        const items: string[] = [];
        while (blocks[i + 1]?.kind === "li") items.push((blocks[++i] as { text: string }).text.trim());
        out.push({ kind: "followups", title: bold[1].replace(/:\s*$/, ""), items });
        continue;
      }
    }
    out.push(b);
  }
  return out;
}
