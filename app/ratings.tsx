import { Redirect } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { ComplaintsPage } from "@/pages/rating/ComplaintsPage";

// "Baholash va sharhlar": the client's ratings on their own route, so the sidebar never lights up "Shikoyatlar" with it.
export default function Screen() {
  return useIsAuthed() ? <ComplaintsPage initial="ratings" /> : <Redirect href="/auth/login" />;
}
