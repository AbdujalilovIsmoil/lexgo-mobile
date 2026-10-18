import { Redirect } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import SecurityLockPage from "@/pages/security-lock/SecurityLockPage";

export default function Screen() {
  return useIsAuthed() ? <SecurityLockPage /> : <Redirect href="/auth/login" />;
}
