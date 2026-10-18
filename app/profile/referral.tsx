import { Redirect } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { ReferralPage } from "@/pages/profile-extras/ReferralPage";

export default function Screen() {
  return useIsAuthed() ? <ReferralPage /> : <Redirect href="/auth/login" />;
}
