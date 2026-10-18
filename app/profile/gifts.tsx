import { Redirect, useLocalSearchParams } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { GiftsPage } from "@/pages/profile-extras/GiftsPage";

export default function Screen() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  return useIsAuthed() ? <GiftsPage code={code} /> : <Redirect href="/auth/login" />;
}
