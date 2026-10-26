import { Redirect } from "expo-router";
import { AcademyPage } from "@/pages/academy/AcademyPage";
import { useIsAuthed } from "@/entities/session";

export default function Screen() {
  return useIsAuthed() ? <AcademyPage /> : <Redirect href="/auth/login" />;
}
