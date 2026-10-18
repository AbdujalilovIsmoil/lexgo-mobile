import { useEffect } from "react";
import { Platform } from "react-native";
import { allowScreenCaptureAsync, preventScreenCaptureAsync } from "expo-screen-capture";

let seq = 0;

/**
 * Blocks screenshots and screen recording while the calling screen is mounted (Android FLAG_SECURE;
 * on iOS the content is hidden from recordings and the app switcher). Use it only on confidential
 * screens — OTP/TOTP secrets, payment requisites, secure chats, signed documents (TZ 1.3, 40).
 * Pass `enabled=false` to switch it off conditionally.
 */
export function useScreenGuard(enabled = true): void {
  useEffect(() => {
    if (!enabled || Platform.OS === "web") return;
    const key = `guard-${++seq}`;
    void preventScreenCaptureAsync(key).catch(() => {});
    return () => void allowScreenCaptureAsync(key).catch(() => {});
  }, [enabled]);
}
