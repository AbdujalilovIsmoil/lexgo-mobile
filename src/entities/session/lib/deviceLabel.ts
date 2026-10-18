import { Platform } from "react-native";
import * as Device from "expo-device";

// What the sessions list shows for this device ("LexGo - iPhone 15 Pro - iOS 18.2"). The backend reads
// it from the X-Device-Label header of the request that creates the session. Model + OS only: the
// owner-chosen device name is personal data and is never sent. Printable ASCII, ≤ 64 chars.
export function deviceLabel(): string {
  const os = `${Device.osName ?? Platform.OS} ${Device.osVersion ?? ""}`.trim();
  const label = ["LexGo", Device.modelName ?? "", os].filter(Boolean).join(" - ");
  return label.replace(/[^\x20-\x7E]/g, "").slice(0, 64);
}

export const deviceHeaders = (): Record<string, string> => ({ "X-Device-Label": deviceLabel() });
