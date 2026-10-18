import { Redirect } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { EntitlementsPage } from "@/pages/subscription/EntitlementsPage";

export default function Screen() {
  return useIsAuthed() ? <EntitlementsPage /> : <Redirect href="/auth/login" />;
}
