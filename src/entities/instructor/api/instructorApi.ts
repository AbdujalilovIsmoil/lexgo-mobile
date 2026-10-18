import { http } from "@/shared/api";
import { asDict } from "@/shared/lib/json";
import type { ActionPreview, ActionResult } from "../model/actionTypes";
import type { ChatReply, InstructorContract } from "../model/types";
import { adoptEndpoints, endpoints } from "./endpoints";
import { normContract } from "./normContract";
import { normPreview, normResult } from "./normPreview";
import { normReply } from "./normReply";

export type TargetBody = { ai_id: string; type: string; label: string; route: string };
export type ChatBody = {
  message: string;
  locale: string;
  current_path: string;
  visible_targets: string[];
  targets: TargetBody[];
  history: { role: "user" | "assistant"; content: string }[];
  session_id?: string;
};

export async function fetchContract(): Promise<InstructorContract | null> {
  return normContract(await http("/ai/instructor/contract"));
}

export async function askInstructor(body: ChatBody): Promise<ChatReply> {
  const raw = asDict(await http("/ai/instructor/chat", { method: "POST", body }));
  adoptEndpoints(raw);
  return normReply(raw, body.session_id);
}

export type ActionBody = { session_id: string; command_id: string; action: string; target?: string; payload: Record<string, unknown> };

export async function previewAction(body: ActionBody): Promise<ActionPreview> {
  return normPreview(await http(endpoints().preview, { method: "POST", body }), body.action);
}

// Only reached after the user confirmed the native dialog. `idempotency_key` = the command id.
export async function confirmAction(body: ActionBody & { confirm_token: string; idempotency_key: string }): Promise<ActionResult> {
  return normResult(await http(endpoints().confirm, { method: "POST", body, headers: { "Idempotency-Key": body.idempotency_key } }));
}

export async function postRuntime(body: Record<string, unknown>): Promise<void> {
  await http(endpoints().runtime, { method: "POST", body });
}

export async function postEvent(body: Record<string, unknown>): Promise<void> {
  await http(endpoints().events, { method: "POST", body });
}

// The stored session with its last response (restores the assistant after an app restart).
export async function fetchSession(id: string): Promise<ChatReply | null> {
  const d = asDict(await http(`/ai/instructor/session/${encodeURIComponent(id)}`));
  const last = asDict(asDict(d.session).last_response);
  return Object.keys(last).length ? normReply(last, id) : null;
}
