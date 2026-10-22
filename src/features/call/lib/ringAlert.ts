import { AppState } from "react-native";
import * as Notifications from "expo-notifications";
import { localPrefs } from "@/entities/notification";
import { useLocaleStore } from "@/shared/i18n/localeStore";
import { translate } from "@/shared/i18n/useT";
import { CALL_ACTIONS, dismissCallAlerts, showLocalAlert } from "@/shared/push";
import type { Incoming } from "./ringEvent";

const idOf = (callId: string) => `call-${callId}`;

/** The app is not on screen (in the background, or started by a push): ring through the OS "calls" channel with Join / Decline. */
export function alertIncoming(inc: Incoming): void {
  if (AppState.currentState === "active") return;
  const t = (k: string) => translate(useLocaleStore.getState().locale, k);
  void showLocalAlert({
    id: idOf(inc.callId), title: inc.callerName || t("admMeet.someone"), body: inc.type === "audio" ? t("admMeet.invitesAudio") : t("admMeet.invitesVideo"),
    category: "calls", event: "call.incoming", data: { room_id: inc.roomId, call_id: inc.callId }, sound: localPrefs().sound, actions: CALL_ACTIONS,
  });
}

/** The ring is over (answered, declined, ended, timed out): take its notification away. */
export const clearIncomingAlert = (callId: string): void => void Promise.all([Notifications.dismissNotificationAsync(idOf(callId)).catch(() => undefined), dismissCallAlerts(callId)]);
