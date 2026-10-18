import { isFinal, useCmdStatus, type CmdStatus, type Command } from "@/entities/instructor";
import { queueEvent, type EventType } from "../events";

function settle(c: Command, status: CmdStatus, reason: string, type: EventType, details?: Record<string, unknown>): boolean {
  if (isFinal(c.id)) return false;
  useCmdStatus.getState().set(c.id, status, reason);
  queueEvent({ event_type: type, command_id: c.id, command_type: c.type, target: c.target || c.modal || undefined, reason: reason || undefined, details });
  return true;
}

export const markRunning = (c: Command): void => useCmdStatus.getState().set(c.id, "running");
export const reportDone = (c: Command, details?: Record<string, unknown>) => settle(c, "done", "", "command_completed", details);
export const reportMissing = (c: Command, reason = "missing_target") => settle(c, "missing", reason, "target_missing", { target_found: false });
export const reportFailed = (c: Command, reason: string, details?: Record<string, unknown>) => settle(c, "failed", reason, "command_failed", details);
export const reportCancelled = (c: Command, reason: string) => settle(c, "cancelled", reason, "command_cancelled");
export const reportSkipped = (c: Command, reason: string) => settle(c, "skipped", reason, "command_cancelled");
