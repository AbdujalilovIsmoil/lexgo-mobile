import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

// Android notification channels (the user can tune each one in system settings). iOS has none.
export type ChannelId = "default" | "messages" | "calls";
export const channelOf = (category: string, event: string): ChannelId =>
  /^(meeting_invite|call\.|call_)/.test(event) ? "calls" : category === "chat" ? "messages" : "default";

/** Creates / renames the channels; call again when the language changes so the names follow it. */
export async function ensureChannels(names: Record<ChannelId, string>): Promise<void> {
  if (Platform.OS !== "android") return;
  const base = { lightColor: "#3B82F6", showBadge: true } as const;
  try {
    await Notifications.setNotificationChannelAsync("default", { ...base, name: names.default, importance: Notifications.AndroidImportance.DEFAULT });
    await Notifications.setNotificationChannelAsync("messages", { ...base, name: names.messages, importance: Notifications.AndroidImportance.HIGH, vibrationPattern: [0, 200, 120, 200] });
    await Notifications.setNotificationChannelAsync("calls", { ...base, name: names.calls, importance: Notifications.AndroidImportance.MAX, vibrationPattern: [0, 500, 250, 500], lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE });
  } catch {
    /* channels are an enhancement: the default channel from app.json still delivers */
  }
}

// An incoming call's OS notification carries two buttons: join (opens the app on the call) and decline (answered without opening it).
export const CALL_ACTIONS = "incoming_call";
export const CALL_JOIN = "join";
export const CALL_DECLINE = "decline";

/** Registers / renames the call buttons; call again when the language changes. The OS keeps them for pushes that arrive while closed. */
export async function ensureCallActions(labels: { join: string; decline: string }): Promise<void> {
  try {
    await Notifications.setNotificationCategoryAsync(CALL_ACTIONS, [
      { identifier: CALL_JOIN, buttonTitle: labels.join, options: { opensAppToForeground: true } },
      { identifier: CALL_DECLINE, buttonTitle: labels.decline, options: { opensAppToForeground: false, isDestructive: true } },
    ]);
  } catch {
    /* without the buttons a tap still opens the call */
  }
}
