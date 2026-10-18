import { normRoom } from "../api/normalizeRoom";
import { roleKey } from "../lib/roleLabel";
import { byActivity, isMyRoom, myRooms, unreadTotal } from "./mine";
import { callIdOf, lastLine, previewText } from "./preview";
import { applyRoomEvent } from "./roomsCache";
import { isClosed, otherMembers, peerOf, roomKind, roomTitle } from "./roomView";
import { HIDDEN, type Room } from "./types";
import { filterRooms, kindOptions } from "@/widgets/secure-chat/inbox";

const ME = "me";
const room = (p: Partial<Room> = {}): Room => ({ id: "r1", status: "active", orderId: "", caseId: "", urgent: false, urgentIds: [], docIds: [], activeRecordId: "", clientId: ME, sellerId: "s1", members: [{ userId: ME, name: "Men", role: "client", phone: "" }, { userId: "s1", name: "Ali", role: "advokat", phone: "+998" }], memberCount: 2, last: null, unread: 0, lastReadAt: "", ttlHours: 0, archivedUntil: "", updatedAt: "2026-10-10T10:00:00Z", createdAt: "2026-10-01T00:00:00Z", ...p });
const t = (k: string, p?: Record<string, string | number>) => (p ? `${k}:${p.text ?? ""}` : k);

describe("normRoom", () => {
  it("reads participants, unread, last message and the records behind the room", () => {
    const r = normRoom({ id: "r", participants: [{ user_id: "a", name: "A", role: "client" }], participant_count: 2, unread_count: -3, last_message: { id: "m", content: "salom", sender_user_id: "a", created_at: "t", is_mine: true }, urgent_advokat_request_ids: ["u1"], document_lawyer_request_ids: ["d1", ""], last_message_at: "L", updated_at: "U" });
    expect(r).toMatchObject({ id: "r", memberCount: 2, unread: 0, urgent: true, urgentIds: ["u1"], docIds: ["d1"], updatedAt: "L" });
    expect(r.last).toMatchObject({ content: "salom", mine: true });
  });
  it("prefers the filtered text of a message and survives junk", () => {
    expect(normRoom({ last_message: { filtered_content: "•••", content: "+998 90" } }).last?.content).toBe("•••");
    expect(normRoom(null)).toMatchObject({ id: "", status: "active", members: [], last: null });
  });
});

describe("my rooms and counters", () => {
  it("only rooms I belong to; archived rooms do not count towards the badge", () => {
    const mine = room({ unread: 2 });
    const other = room({ id: "x", clientId: "a", sellerId: "b", members: [], unread: 5 });
    const archived = room({ id: "y", status: "archived", unread: 7 });
    expect(isMyRoom(other, ME)).toBe(false);
    expect(myRooms([mine, other, archived], ME).map((r) => r.id)).toEqual(["r1", "y"]);
    expect(unreadTotal([mine, other, archived], ME)).toBe(2);
    expect(isMyRoom(other, "")).toBe(true); // not signed in: nothing is filtered
  });
  it("newest activity first, bad dates last", () => {
    const rooms = [room({ id: "a", updatedAt: "2026-10-01T00:00:00Z" }), room({ id: "b", updatedAt: "2026-10-09T00:00:00Z" }), room({ id: "c", updatedAt: "bad" })];
    expect(rooms.sort(byActivity).map((r) => r.id)).toEqual(["b", "a", "c"]);
  });
});

describe("room view", () => {
  it("kind by what is behind the room", () => {
    expect(roomKind(room({ urgent: true, docIds: ["d"] }))).toBe("urgent");
    expect(roomKind(room({ docIds: ["d"] }))).toBe("doc");
    expect(roomKind(room({ orderId: "o" }))).toBe("order");
    expect(roomKind(room({ caseId: "c" }))).toBe("case");
    expect(roomKind(room())).toBe("other");
  });
  it("title is the other people, never a phone number", () => {
    expect(roomTitle(room(), ME)).toBe("Ali");
    expect(roomTitle(room({ members: [{ userId: "a", name: "A", role: "", phone: "" }, { userId: "b", name: "B", role: "", phone: "" }, { userId: "c", name: "C", role: "", phone: "" }] }), ME)).toBe("A, B +1");
    expect(roomTitle(room({ members: [{ userId: "a", name: "", role: "", phone: "+998901234567" }] }), ME)).toBe("");
    expect(roomTitle(room({ members: [], last: { id: "m", senderId: "z", senderName: "Zafar", type: "text", content: "x", createdAt: "", mine: false } }), ME)).toBe("Zafar");
  });
  it("peer is the one other person, none for a group; closed rooms take no messages", () => {
    expect(peerOf(room(), ME)?.userId).toBe("s1");
    expect(peerOf(room({ memberCount: 3 }), ME)).toBeNull();
    expect(otherMembers(room({ members: [{ userId: ME, name: "Men", role: "", phone: "" }] }), ME)).toHaveLength(1);
    expect(isClosed(room({ status: "completed" }))).toBe(true);
    expect(isClosed(room())).toBe(false);
    expect(isClosed(undefined)).toBe(false);
  });
  it("role chip only for roles we have words for", () => {
    expect(roleKey("Advokat")).toBe("ms4.role.advokat");
    expect(roleKey("call_center_lawyer")).toBe("ms4.role.duty");
    expect(roleKey("martian")).toBe("");
  });
});

describe("previews", () => {
  it("voice, file, call, hidden and text", () => {
    expect(previewText({ type: "voice", content: "x" }, t)).toBe("admChatB.voiceNote");
    expect(previewText({ type: "file", content: "a.pdf", fileName: "contract.pdf" }, t)).toBe("contract.pdf");
    expect(previewText({ type: "text", content: "/calls/12345678-aaaa/join" }, t)).toBe("admChat.callMsg");
    expect(previewText({ type: "text", content: HIDDEN }, t)).toBe("admChat.hiddenText");
    expect(previewText({ type: "text", content: "salom" }, t)).toBe("salom");
    expect(callIdOf("x /calls/abcdef12-3456/join y")).toBe("abcdef12-3456");
  });
  it("my own last message is prefixed", () => {
    expect(lastLine({ id: "1", senderId: ME, senderName: "", type: "text", content: "salom", createdAt: "", mine: true }, t)).toBe("admChat.mine:salom");
  });
});

describe("applyRoomEvent", () => {
  const msg = (id: string, sender: string) => ({ event: "secure_chat.message_created", room_id: id, message: { id: "m2", content: "yangi", sender_user_id: sender, created_at: "2026-10-18T10:00:00Z" } });
  it("moves the room to the top, bumps unread for someone else's message only", () => {
    const rooms = [room({ id: "a", unread: 1 }), room({ id: "b", unread: 0 })];
    const next = applyRoomEvent(rooms, msg("b", "s1"), ME)!;
    expect(next.map((r) => r.id)).toEqual(["b", "a"]);
    expect(next[0]).toMatchObject({ unread: 1, last: { content: "yangi", mine: false } });
    expect(applyRoomEvent(rooms, msg("b", ME), ME)![0].unread).toBe(0);
  });
  it("takes the unread count from the room snapshot when the event has one", () => {
    const next = applyRoomEvent([room({ id: "a", unread: 5 })], { ...msg("a", "s1"), room: { unread_count: 2 } }, ME)!;
    expect(next[0].unread).toBe(2);
  });
  it("asks for a refetch for an unknown room; ignores other events and ids", () => {
    expect(applyRoomEvent([room()], msg("zzz", "s1"), ME)).toBeNull();
    const rooms = [room()];
    expect(applyRoomEvent(rooms, { event: "other.thing", room_id: "r1" }, ME)).toBe(rooms);
    expect(applyRoomEvent(rooms, { event: "secure_chat.message_created" }, ME)).toBe(rooms);
  });
  it("my own read clears the badge, somebody else's does not", () => {
    const rooms = [room({ unread: 4 })];
    expect(applyRoomEvent(rooms, { event: "secure_chat.read", room_id: "r1", user_id: ME, unread_count: 0 }, ME)![0].unread).toBe(0);
    expect(applyRoomEvent(rooms, { event: "secure_chat.read", room_id: "r1", user_id: "s1", unread_count: 0 }, ME)).toBe(rooms);
  });
});

describe("inbox filters", () => {
  const a = room({ id: "a", unread: 2, orderId: "ADV-1", last: { id: "m", senderId: "s1", senderName: "Ali", type: "text", content: "Nikoh shartnomasi", createdAt: "", mine: false } });
  const b = room({ id: "b", urgent: true, members: [{ userId: ME, name: "Men", role: "", phone: "" }, { userId: "s2", name: "Vali", role: "", phone: "" }] });
  it("search by person, message and order number; kind narrows", () => {
    expect(filterRooms([a, b], ME, "nikoh", "all", t).map((r) => r.id)).toEqual(["a"]);
    expect(filterRooms([a, b], ME, "vali", "all", t).map((r) => r.id)).toEqual(["b"]);
    expect(filterRooms([a, b], ME, "ADV-1", "all", t).map((r) => r.id)).toEqual(["a"]);
    expect(filterRooms([a, b], ME, "", "unread", t).map((r) => r.id)).toEqual(["a"]);
    expect(filterRooms([a, b], ME, "", "urgent", t).map((r) => r.id)).toEqual(["b"]);
  });
  it("kind options list only what exists, with counts, but keep the selected one", () => {
    const opts = kindOptions([a, b], t);
    expect(opts.map((o) => o.value)).toEqual(["all", "unread", "urgent", "order"]);
    expect(opts.find((o) => o.value === "all")?.count).toBe(2);
    expect(kindOptions([a], t, "doc").map((o) => o.value)).toContain("doc");
  });
});
