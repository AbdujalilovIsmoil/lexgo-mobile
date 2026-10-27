import { asDict, asStr } from "@/shared/lib/json";

export type RemoteData = {
  type: string;
  callId: string;
  taskId: string;
  roomId: string;
  callerName: string;
  callerId: string;
  callType: string;
  sessionId: string; // a remote-assistance session (remote_assist.requested)
  action: string; // a notification button the person pressed (a response handed to the background task), "" otherwise
};

const parse = (v: unknown): Record<string, unknown> => {
  if (typeof v !== "string") return asDict(v);
  try {
    return asDict(JSON.parse(v));
  } catch {
    return {};
  }
};

// What a remote push carries, whichever shape the OS / expo-notifications hands over: the data bag itself, a notification response or a
// received notification (content.data), or the FCM data JSON-encoded in `dataString` / `body`. Anything else reads as empty.
export function remoteDataOf(payload: unknown): RemoteData {
  const p = asDict(payload);
  const content = asDict(asDict(asDict(p.notification).request).content);
  const req = asDict(asDict(p.request).content);
  const bags = [asDict(p.data), parse(asDict(p.data).dataString), parse(asDict(p.data).body), parse(content.data), parse(req.data), p];
  const pick = (k: string): string => bags.map((b) => asStr(b[k])).find(Boolean) ?? "";
  return {
    type: pick("type") || pick("event"),
    callId: pick("call_id"),
    taskId: pick("task_id"),
    roomId: pick("room_id") || pick("secure_chat_room_id"),
    callerName: pick("caller_name"),
    callerId: pick("caller_user_id"),
    callType: pick("call_type"),
    sessionId: pick("session_id") || pick("remote_assist_session_id"),
    action: asStr(p.actionIdentifier),
  };
}

/** One call / task event is announced once, however many channels (socket, push, local alert) bring it: type + call_id / task_id. */
export const dedupeKey = (d: RemoteData): string => (d.callId ? `${d.type}:${d.callId}` : d.taskId ? `${d.type}:${d.taskId}` : "");
