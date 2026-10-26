import { http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";

// The professional's case tool (the web's "Sun'iy intellekt yordamchi"): POST /ai/assistant {prompt, context?: {text}}. A tool sends its
// instruction as the prompt and the pasted case as the context; a free question is the prompt alone. The backend masks phone numbers,
// e-mails, PINFL and passport numbers before the text reaches the model. The answer comes back as `answer`, `text` or `reply`.
export const CASE_TOOLS = ["summarize", "chronology", "compare", "contradictions", "missing", "deadlines", "questions", "draft"] as const;
export type CaseTool = (typeof CASE_TOOLS)[number];

// The web asks for at least this much text before any tool runs.
export const MIN_CASE_CHARS = 8;

export async function askAssistant(prompt: string, text?: string): Promise<string> {
  const d = asDict(await http("/ai/assistant", { method: "POST", body: text ? { prompt, context: { text } } : { prompt } }));
  return asStr(d.answer ?? d.text ?? d.reply).trim();
}
