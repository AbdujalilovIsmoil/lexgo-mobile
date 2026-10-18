const enc = encodeURIComponent;
type ChatOpts = { join?: string; doc?: string };

/** Route of the in-app call screen — other modules `router.push` to it (cast `as never`: typed routes are generated at dev time). */
export const callPath = (roomId: string, callId: string): string => `/call/${enc(roomId)}?callId=${enc(callId)}`;

/** Route of a chat room. `join` opens that call at once; `doc` is the document request the room belongs to
 *  (it turns on the client's "call the advocate" button, POST /document-requests/{doc}/calls/audio). */
export function chatPath(roomId: string, opts: ChatOpts | string = {}): string {
  const o: ChatOpts = typeof opts === "string" ? { join: opts } : opts;
  const q = [o.join ? `join=${enc(o.join)}` : "", o.doc ? `doc=${enc(o.doc)}` : ""].filter(Boolean).join("&");
  return `/chat/${enc(roomId)}${q ? `?${q}` : ""}`;
}

/** Route of a meeting's page; the room id makes the lookup instant. */
export const meetingPath = (callId: string, roomId = ""): string => `/meetings/${enc(callId)}${roomId ? `?room=${enc(roomId)}` : ""}`;
