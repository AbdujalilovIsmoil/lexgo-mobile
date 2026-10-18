import { Redirect } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import TotpSetupPage from "@/pages/security-totp/TotpSetupPage";

export default function Screen() {
  return useIsAuthed() ? <TotpSetupPage /> : <Redirect href="/auth/login" />;
}
