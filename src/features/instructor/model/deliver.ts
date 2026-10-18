import type { ChatReply } from "@/entities/instructor";
import { useInstructorSession } from "@/entities/instructor";
import { useInstructorChat, msgId } from "./chatStore";
import { runCommands } from "./runner/run";
import { useInstructorUi } from "./uiStore";

const turns = (): { q: string; a: string }[] => {
  const out: { q: string; a: string }[] = [];
  let q = "";
  for (const m of useInstructorChat.getState().messages) {
    if (m.role === "user") q = m.text;
    else out.push({ q, a: m.text });
  }
  return out.slice(-10);
};

const seen: string[] = [];

// An assistant answer (HTTP reply, restored session or socket push): show it, then run what it asks for.
// The same response id is delivered once, whichever way it arrives first.
export function deliver(reply: ChatReply, question: string, run = true): void {
  if (reply.responseId) {
    if (seen.includes(reply.responseId)) return;
    seen.push(reply.responseId);
    if (seen.length > 100) seen.shift();
  }
  const chat = useInstructorChat.getState();
  chat.add({ id: msgId(), role: "assistant", text: reply.answer, reply });
  useInstructorUi.getState().touch();
  const sessionId = reply.sessionId || useInstructorSession.getState().sessionId;
  if (run && reply.commands.length && sessionId) void runCommands(reply.commands, { sessionId, message: question, answer: reply.answer, history: turns() });
}

export { turns };
