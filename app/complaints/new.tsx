import { Redirect, useLocalSearchParams } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { NewComplaintPage } from "@/pages/rating/NewComplaintPage";

// ?about=<work> fills in the work the complaint is about.
export default function Screen() {
  const { about } = useLocalSearchParams<{ about?: string }>();
  if (!useIsAuthed()) return <Redirect href="/auth/login" />;
  return <NewComplaintPage about={about ?? ""} />;
}
