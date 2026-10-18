import { Linking, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { create } from "zustand";
import { track } from "@/shared/analytics";

export type PermStatus = "granted" | "denied" | "undetermined";
type PermState = { status: PermStatus; canAskAgain: boolean; loaded: boolean };

// Notification permission as the OS reports it. Refreshed on start, on foreground (the user may have
// changed it in Settings) and after a request. The prompt itself is shown in context (the permission
// card), never at launch.
export const usePermissionStore = create<PermState>(() => ({ status: "undetermined", canAskAgain: true, loaded: false }));
export const usePushPermission = (): PermState => usePermissionStore();

function apply(p: Notifications.NotificationPermissionsStatus): PermState {
  const status: PermStatus = p.granted || p.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL ? "granted" : p.status === "denied" ? "denied" : "undetermined";
  const next = { status, canAskAgain: p.canAskAgain !== false, loaded: true };
  usePermissionStore.setState(next);
  return next;
}

export async function readPermission(): Promise<PermState> {
  try {
    return apply(await Notifications.getPermissionsAsync());
  } catch {
    return usePermissionStore.getState();
  }
}

export async function askPermission(): Promise<PermStatus> {
  try {
    const next = apply(await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowBadge: true, allowSound: true } }));
    track("push_permission", { result: next.status });
    return next.status;
  } catch {
    return usePermissionStore.getState().status;
  }
}

// The OS page of this app's settings (the only way back once Android/iOS stopped asking).
export const openSystemSettings = (): void => void Linking.openSettings().catch(() => {});
export const pushSupported = Platform.OS === "android" || Platform.OS === "ios";
