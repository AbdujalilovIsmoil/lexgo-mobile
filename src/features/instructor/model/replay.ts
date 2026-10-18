import { useInstructorSession, type ChatReply } from "@/entities/instructor";
import { activeContract } from "./contractRef";
import { turns } from "./deliver";
import { isMutating } from "./runner/payload";
import { runCommands } from "./runner/run";

let n = 0;

// "Show me again": the guiding commands of an earlier answer under fresh ids. Anything that needs a
// confirmation is NOT replayed — an action is only ever started by a new, explicit request.
export function replayReply(reply: ChatReply): void {
  const sessionId = useInstructorSession.getState().sessionId;
  const extra = activeContract()?.mutatingActions ?? [];
  const cmds = reply.commands.filter((c) => !isMutating(c, extra)).map((c) => ({ ...c, id: `${c.id}~r${++n}` }));
  if (sessionId && cmds.length) void runCommands(cmds, { sessionId, message: "", answer: reply.answer, history: turns() });
}

// Does an answer have anything the app can show the user again (not just text)?
export const canReplay = (reply: ChatReply): boolean => reply.commands.some((c) => ["navigate", "highlight", "tooltip", "scroll_to", "open_modal"].includes(c.type));

// Is the answer an offer of human help (support) rather than guidance?
export const offersSupport = (reply: ChatReply): boolean =>
  reply.support.available && (reply.intent === "support_guidance" || reply.missing.length > 0 || !reply.commands.some((c) => c.type !== "show_steps"));
