import { usePreventScreenCapture } from "expo-screen-capture";

// While mounted the screen cannot be screenshotted / recorded and the app-switcher preview is blank
// (TZ 1.3 / 40: only on secret screens — here the authenticator QR and key).
export function SecretGuard() {
  usePreventScreenCapture("totp-secret");
  return null;
}
