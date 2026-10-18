import { asStr } from "@/shared/lib/json";
import type { Notification } from "@/entities/notification";

const ID_KEYS = ["room_id", "secure_chat_room_id", "ticket_id", "record_id", "document_request_id", "order_id", "call_id", "payment_id"];

// True when the event is about the screen the user is looking at right now (the chat room that is
// open, the ticket being read, the notification list itself): no banner, the screen updates live.
export function onScreen(n: Notification, pathname: string): boolean {
  if (pathname.startsWith("/notifications") || pathname === "/notifs") return true;
  return ID_KEYS.some((k) => {
    const id = asStr(n.data[k]);
    return !!id && pathname.includes(id);
  });
}
