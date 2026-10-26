import type { Href } from "expo-router";

// Routes of the chat / call packages and of this one. Typed routes are generated at runtime, hence the cast.
const to = (path: string): Href => path as unknown as Href;
const qs = (o: Record<string, string | undefined>): string => {
  const q = new URLSearchParams();
  Object.entries(o).forEach(([k, v]) => v && q.set(k, v));
  return q.size ? `?${q}` : "";
};

export const chatHref = (roomId: string, o: { ua?: string; wid?: string } = {}): Href => to(`/chat/${encodeURIComponent(roomId)}${qs(o)}`);
export const callHref = (roomId: string, callId: string): Href => to(`/call/${encodeURIComponent(roomId)}${qs({ callId })}`);
export type Scope = "client" | "pro";
export const detailHref = (scope: Scope, id: string): Href => to(`${scope === "client" ? "/urgent" : "/pro/urgent"}/${encodeURIComponent(id)}`);
export const orderHref = (service?: string, from?: "urgent"): Href => to(`/urgent/new${qs({ service, from })}`);
// The shared rating screen (payments package) rates an urgent request by its work id.
export const rateHref = (workId: string): Href => to(`/rate/${encodeURIComponent(workId)}`);
