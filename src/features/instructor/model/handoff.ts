import { useInstructorSession } from "@/entities/instructor";
import { useInstructorChat } from "./chatStore";
import { turns } from "./deliver";
import { queueEvent } from "./events";
import { runCommands } from "./runner/run";

// "Talk to an operator": the same safe path as any action — preview → native confirm → confirm → ticket.
export function startSupportHandoff(): void {
  const sessionId = useInstructorSession.getState().sessionId;
  if (!sessionId) return;
  const lastUser = [...useInstructorChat.getState().messages].reverse().find((m) => m.role === "user");
  const id = `handoff-${Date.now().toString(36)}`;
  queueEvent({ event_type: "support_handoff_requested", command_id: id });
  const cmd = { id, type: "support_handoff", action: "start_support_ticket", href: "", target: "", modal: "", text: "", style: "", durationMs: 0, fields: {}, payload: {}, steps: [] };
  void runCommands([cmd], { sessionId, message: lastUser?.text ?? "", answer: "", history: turns() });
}
