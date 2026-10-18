import { HIDDEN, type LastMessage } from "./types";

type Tr = (key: string, params?: Record<string, string | number>) => string;
export const CALL_PATH = /\/calls\/([0-9a-f-]{8,})\/join/i;
/** Id of the call a "meeting" / "call" message points at, or "". */
export const callIdOf = (content: string): string => CALL_PATH.exec(content)?.[1] ?? "";

/** One line standing in for a message (inbox row, reply quote, copy). */
export function previewText(m: { type: string; content: string; fileName?: string }, t: Tr): string {
  if (m.content === HIDDEN) return t("admChat.hiddenText");
  if (m.type === "voice") return t("admChatB.voiceNote");
  if (m.type === "file") return m.fileName || m.content || t("admChat.fileMsg");
  if (m.type === "meeting" || m.type === "call" || callIdOf(m.content)) return t("admChat.callMsg");
  return m.content;
}

export const lastLine = (last: LastMessage, t: Tr): string => {
  const text = previewText(last, t);
  return last.mine ? t("admChat.mine", { text }) : text;
};
