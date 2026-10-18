import { useIsAuthed } from "@/entities/session";
import SecurityPage from "@/pages/security/SecurityPage";
import { Redirect } from "expo-router";

export default function Screen() {
  return useIsAuthed() ? <SecurityPage /> : <Redirect href="/auth/login" />;
}
