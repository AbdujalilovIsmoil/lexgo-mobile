import { IncomingCallWatcher } from "@/widgets/call";
import { useUnreadBadge } from "@/features/secure-chat";

// App-level mount point of the Msg package (rendered once inside the app providers): the full-screen incoming-call
// ring, and the secure-chat realtime — room list kept fresh and the "Xabarlar" tab badge in step with unread counters.
export function MsgMounts() {
  useUnreadBadge();
  return <IncomingCallWatcher />;
}
