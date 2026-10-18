// An event pushed on /ws/users/me. `event` is the name (call.incoming,
// notification.created, document_request.claimed …); the rest is its payload.
export type UserEvent = { event: string } & Record<string, unknown>;
export type UserEventHandler = (e: UserEvent) => void;
export type SocketState = "offline" | "connecting" | "online";
