import { Redirect, useLocalSearchParams } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { ComplaintsPage } from "@/pages/rating/ComplaintsPage";

// ?tab=ratings|warranty, ?work=<id> opens that complaint; ?new=1 / ?about=<work> (old links) go to the new-complaint page.
export default function Screen() {
  const { tab, work, about, new: isNew } = useLocalSearchParams<{ tab?: string; work?: string; about?: string; new?: string }>();
  const initial = tab === "ratings" || tab === "warranty" ? tab : "complaints";
  if (!useIsAuthed()) return <Redirect href="/auth/login" />;
  if (isNew === "1" || about) return <Redirect href={{ pathname: "/complaints/new", params: about ? { about } : {} }} />;
  return <ComplaintsPage initial={initial} work={work} />;
}
