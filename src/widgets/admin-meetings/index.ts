// Compatibility shim. The incoming-call ring moved to `widgets/call` and is mounted by core/providers/mounts/MsgMounts;
// the stub below keeps the old mount in AppProviders harmless (it renders nothing) until the lead removes that line.
// The meetings widgets moved to `widgets/meetings` (re-exported for the call-centre tab).
export { MyMeetings, PlatformMeetings } from "@/widgets/meetings";
export const IncomingCallWatcher = (): null => null;
