import { Redirect } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { ConsentsPage } from "@/pages/profile-extras/ConsentsPage";

export default function Screen() {
  return useIsAuthed() ? <ConsentsPage /> : <Redirect href="/auth/login" />;
}
