import { AppState } from "react-native";
import { patchParticipant } from "@/entities/call";
import { bindSessionToHttp, useSessionStore } from "@/entities/session";
import { useLocalPrefs } from "@/entities/notification";
import { useLocaleStore } from "@/shared/i18n/localeStore";
import { netLog } from "@/shared/network";
import { deviceId, dismissCallAlerts } from "@/shared/push";
import { emitUserEvent } from "@/shared/realtime";
import { alertIncoming } from "./ringAlert";

export type PushRing = { roomId: string; callId: string; callerName: string; callerId: string; callType: string };

// The stores a push handler needs when the OS started the app without a screen (a data push while it was closed).
async function wake(): Promise<void> {
  bindSessionToHttp();
  if (!useSessionStore.getState().session) await useSessionStore.getState().hydrate();
  await useLocaleStore.persist.rehydrate();
  await useLocalPrefs.persist.rehydrate();
}

/**
 * A `call.incoming` push. With the app open it is handed to the full-screen ring (the same path as the socket, so one call rings once);
 * otherwise it becomes an OS notification on the calls channel with Join / Decline — the only way a closed app can ring.
 */
export async function ringFromPush(p: PushRing): Promise<void> {
  if (!p.roomId || !p.callId) return;
  if (AppState.currentState === "active") {
    netLog("call", `push ${p.callId.slice(0, 8)} -> to the ring`);
    emitUserEvent({ event: "call.incoming", room_id: p.roomId, call_id: p.callId, caller_name: p.callerName, caller_user_id: p.callerId, call_type: p.callType });
    return;
  }
  await wake();
  if (p.callerId && p.callerId === useSessionStore.getState().session?.user.id) return; // my own call on my other device
  netLog("call", `push ${p.callId.slice(0, 8)} -> notification`);
  alertIncoming({ roomId: p.roomId, callId: p.callId, type: p.callType === "audio" ? "audio" : "video", callerName: p.callerName, title: "" });
}

/** "Decline" on the call notification: the call is declined for this device without opening the app, and its notification goes. */
export async function declineFromNotification(roomId: string, callId: string): Promise<void> {
  if (!roomId || !callId) return;
  await dismissCallAlerts(callId);
  await wake();
  const me = useSessionStore.getState().session?.user.id;
  if (!me) return;
  const d = await deviceId();
  netLog("call", `notification ${callId.slice(0, 8)} -> declined`);
  await patchParticipant(roomId, callId, me, { status: "declined", ...(d ? { answered_device_id: d } : {}) }).catch(() => undefined);
}
