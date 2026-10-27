export type Sender = { id: string; name: string; role: string; phone: string };
export type Member = { userId: string; name: string; role: string; phone: string };
export type LastMessage = { id: string; senderId: string; senderName: string; type: string; content: string; createdAt: string; mine: boolean };

export type Room = {
  id: string;
  status: string; // active | archived | completed
  orderId: string;
  caseId: string;
  urgent: boolean; // belongs to a Tezkor Advokat request
  urgentIds: string[]; // Tezkor Advokat request records behind the room
  docIds: string[]; // document lawyer-request records behind the room
  activeRecordId: string;
  clientId: string;
  sellerId: string;
  members: Member[];
  memberCount: number;
  last: LastMessage | null;
  unread: number;
  lastReadAt: string; // my own last read (the backend sends nobody else's)
  ttlHours: number; // auto-delete window, 0 = off
  archivedUntil: string;
  updatedAt: string;
  createdAt: string;
};

export type MsgFile = { name: string; mime: string; size: number; path: string }; // path = authed download url
export type Reply = { id: string; sender: Sender | null; type: string; content: string };

export type Msg = {
  id: string;
  senderId: string;
  sender: Sender | null;
  type: string; // text | file | voice | system | result | meeting | call
  content: string;
  blocked: boolean;
  blockReason: string;
  createdAt: string;
  file: MsgFile | null;
  reply: Reply | null;
  replyToId: string;
  urgentId: string; // the Tezkor Advokat request a system / result message is about
  pending?: boolean; // optimistic bubble waiting for the server
  queued?: boolean; // a file / voice note waiting for the upload before it to finish (one file per request, in order)
  failed?: boolean;
  refused?: boolean; // the server will not take this file (type, size, broken file): sending it again cannot help
  progress?: number; // 0..1 while a file / voice note uploads
  localUri?: string; // the picked / recorded file, playable before the upload finishes
};

// Staff only read "[metadata_only]" until a second person approves a reveal.
export type PickedFile = { uri: string; name: string; mime: string; size: number };
export const HIDDEN = "[metadata_only]";
