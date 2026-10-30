import { Redirect, useLocalSearchParams } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { ProfileSectionPage } from "@/pages/profile/ProfileSectionPage";

// /profile/section/<personal|family|security|payments|activity> — one section of the client profile.
export default function Screen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  if (!useIsAuthed()) return <Redirect href="/auth/login" />;
  return <ProfileSectionPage section={key ?? ""} />;
}
