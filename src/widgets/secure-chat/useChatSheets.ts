import { useState } from "react";
import type { Msg, OpenFile } from "@/entities/secure-chat";

export type SheetName = "" | "menu" | "members" | "ttl" | "complete";

// Which drawer / viewer of a chat room is open: room menu, members, auto-delete choice, completion form,
// the long-pressed message and the full-screen file preview.
export function useChatSheets() {
  const [sheet, setSheet] = useState<SheetName>("");
  const [target, setTarget] = useState<Msg | null>(null);
  const [file, setFile] = useState<OpenFile | null>(null);
  const [reply, setReply] = useState<Msg | null>(null);
  return { sheet, setSheet, target, setTarget, file, setFile, reply, setReply };
}
export type SheetState = ReturnType<typeof useChatSheets>;
