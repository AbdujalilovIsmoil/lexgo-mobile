import { Redirect, useLocalSearchParams } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { ComplaintsPage } from "@/pages/rating/ComplaintsPage";

// ?tab=ratings|warranty, ?work=<id> opens that complaint, ?new=1 / ?about=<work> opens the form.
export default function Screen() {
  const { tab, work, about, new: isNew } = useLocalSearchParams<{ tab?: string; work?: string; about?: string; new?: string }>();
  const initial = tab === "ratings" || tab === "warranty" ? tab : "complaints";
  if (!useIsAuthed()) return <Redirect href="/auth/login" />;
  return <ComplaintsPage initial={initial} work={work} about={about} openNew={isNew === "1"} />;
}
