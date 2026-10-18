import { postEvent, useInstructorSession } from "@/entities/instructor";
import { ApiError } from "@/shared/api";
import { currentPath } from "@/shared/instructor";

// Telemetry for /ai/instructor/events: command outcomes and screen changes — ids, routes and reasons only,
// never typed values, phones, message text or file URLs (TZ 41).
export type EventType = "command_completed" | "command_failed" | "command_cancelled" | "target_missing" | "route_changed" | "user_cancelled" | "support_handoff_requested";
export type AiEvent = { event_type: EventType; command_id?: string; command_type?: string; target?: string; reason?: string; details?: Record<string, unknown> };

const queue: Record<string, unknown>[] = [];
let pumping = false;
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const failed = (t: EventType) => t === "command_failed" || t === "target_missing";

async function pump(): Promise<void> {
  if (pumping) return;
  pumping = true;
  try {
    for (let body = queue.shift(); body; body = queue.shift()) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          await postEvent(body);
          break;
        } catch (e) {
          if (e instanceof ApiError && e.status === 404) return void (queue.length = 0);
          if (!(e instanceof ApiError) || (e.status !== 0 && e.status < 500)) break;
          await sleep(800);
        }
      }
    }
  } finally {
    pumping = false;
  }
}

export function queueEvent(e: AiEvent): void {
  const sid = useInstructorSession.getState().sessionId;
  if (!sid) return;
  const route = currentPath();
  const status = e.event_type === "command_cancelled" || e.event_type === "user_cancelled" ? "cancelled" : failed(e.event_type) ? "failed" : "completed";
  queue.push({ session_id: sid, ...e, status, current_route: route, details: { route, ...e.details } });
  if (queue.length > 60) queue.shift();
  void pump();
}
