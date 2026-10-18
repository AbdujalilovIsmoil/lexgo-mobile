import { useEffect, useState } from "react";
import { approveReveal, chatKeys, requestReveal } from "@/entities/secure-chat";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { readJson, writeJson } from "@/shared/lib/storage";

const key = (roomId: string) => `adm_reveal_${roomId}`;

// Content reveal: staff read "[metadata_only]" until a reveal is requested (with a reason) and approved.
// The backend wants the pending request's id for the approval but never shows it in the status, so the
// id returned by the request is remembered on this device (and can be typed in by another approver).
export function useRevealActions(roomId: string, onDone: () => void) {
  const [requestId, setRequestId] = useState("");
  useEffect(() => { void readJson<string>(key(roomId)).then((v) => setRequestId(v ?? "")); }, [roomId]);
  const request = useAdminMutation({
    mutationFn: async (reason: string) => {
      const id = await requestReveal(roomId, reason);
      await writeJson(key(roomId), id || null);
      setRequestId(id);
    },
    invalidate: [chatKeys.reveal(roomId)],
    success: "admChat.revealRequested",
    onSuccess: onDone,
  });
  const approve = useAdminMutation({
    mutationFn: (typed: string) => approveReveal(roomId, typed.trim() || requestId),
    invalidate: [chatKeys.reveal(roomId)],
    success: "admChat.revealApproved",
    onSuccess: () => { void writeJson(key(roomId), null); setRequestId(""); onDone(); },
  });
  return { requestId, request, approve };
}
