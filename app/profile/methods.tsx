import { Redirect } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { MethodsPage } from "@/pages/profile-extras/MethodsPage";

export default function Screen() {
  return useIsAuthed() ? <MethodsPage /> : <Redirect href="/auth/login" />;
}
