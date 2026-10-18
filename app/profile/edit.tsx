import { Redirect } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { EditProfilePage } from "@/pages/profile-extras/EditProfilePage";

export default function Screen() {
  return useIsAuthed() ? <EditProfilePage /> : <Redirect href="/auth/login" />;
}
