import { subscribeUserEvents as subscribe, onResync, useSocketStatus, type SocketState, type UserEvent } from "@/shared/realtime";

// The per-user realtime socket (wss://…/ws/users/me) is one app-wide connection
// owned by core's SessionBoundary (shared/realtime). These helpers keep the old
// admin-chats API working on top of it.
export type { UserEvent };
/** The connection follows the session now; retaining it is a no-op kept for callers. */
export const retainUserSocket = (): (() => void) => () => undefined;
export const subscribeUserEvents = (h: (e: UserEvent) => void) => subscribe(h);
export const subscribeUserSocketState = (h: (s: SocketState) => void) => useSocketStatus.subscribe((st) => h(st.state));
export const onUserSocketResync = (h: () => void) => onResync(h);
export const userSocketState = (): SocketState => useSocketStatus.getState().state;
export const nudgeUserSocket = () => undefined;
