// Compatibility shim: the secure-chat code moved to the neutral slice `entities/secure-chat` (every role uses it).
// The old user-socket wrappers stay here for slices that still import them (admin-support); new code uses @/shared/realtime.
export * from "@/entities/secure-chat";
export { ReconnectingSocket, type SocketState } from "./lib/reconnectingSocket";
export { subscribeUserEvents, subscribeUserSocketState, onUserSocketResync, retainUserSocket, userSocketState, nudgeUserSocket, type UserEvent } from "./lib/userSocket";
export { useUserSocket, useUserEvents } from "./lib/useUserSocket";
