import { Redirect } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { ComplaintsPage } from "@/pages/rating/ComplaintsPage";

export default function Screen() {
  return useIsAuthed() ? <ComplaintsPage initial="warranty" /> : <Redirect href="/auth/login" />;
}
