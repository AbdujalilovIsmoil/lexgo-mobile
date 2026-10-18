import { Redirect } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { FamilyPage } from "@/pages/profile-extras/FamilyPage";

export default function Screen() {
  return useIsAuthed() ? <FamilyPage /> : <Redirect href="/auth/login" />;
}
