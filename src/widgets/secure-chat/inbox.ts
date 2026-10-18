import { previewText } from "@/entities/secure-chat/model/preview";
import { roomKind, roomTitle } from "@/entities/secure-chat/model/roomView";
import type { Room } from "@/entities/secure-chat/model/types";

export type InboxKind = "all" | "unread" | "urgent" | "doc" | "order" | "case" | "other";
type Tr = (key: string) => string;

/** Search by people / last message / work ids, narrowed by the chosen chip. */
export function filterRooms(rooms: Room[], myId: string, search: string, kind: InboxKind, t: Tr, tagOf: (r: Room) => string = () => ""): Room[] {
  const needle = search.trim().toLowerCase();
  return rooms.filter((r) => {
    if (kind === "unread" ? r.unread === 0 : kind !== "all" && roomKind(r) !== kind) return false;
    if (!needle) return true;
    const last = r.last ? previewText(r.last, t) : "";
    return [roomTitle(r, myId), last, r.orderId, r.caseId, tagOf(r)].some((v) => v.toLowerCase().includes(needle));
  });
}

/** Chips for the inbox: only the kinds that exist, each with its count. */
export function kindOptions(rooms: Room[], t: Tr, selected: InboxKind = "all") {
  const count = (k: InboxKind) => rooms.filter((r) => (k === "all" ? true : k === "unread" ? r.unread > 0 : roomKind(r) === k)).length;
  const kinds: InboxKind[] = ["all", "unread", "urgent", "doc", "order", "case", "other"];
  return kinds.filter((k) => k === "all" || k === selected || count(k) > 0).map((k) => ({ value: k, label: k === "all" ? t("adm.all") : k === "unread" ? t("admChatB.unread") : t(`ms1.kind.${k}`), count: count(k) }));
}
