import { Redirect, useLocalSearchParams } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { RatePage } from "@/pages/rating/RatePage";

export default function Screen() {
  const { workId } = useLocalSearchParams<{ workId: string }>();
  return useIsAuthed() ? <RatePage workId={workId} /> : <Redirect href="/auth/login" />;
}
