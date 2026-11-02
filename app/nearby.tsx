import { Redirect } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { NearbyPage } from "@/pages/nearby/NearbyPage";

// /nearby — specialists near me on the Yandex map (signed-in users: the nearby search and consent are personal).
export default function Screen() {
  return useIsAuthed() ? <NearbyPage /> : <Redirect href="/auth/login" />;
}
