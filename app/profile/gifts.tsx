import { Redirect, useLocalSearchParams } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { GiftsPage } from "@/pages/profile-extras/GiftsPage";
import { DigitalOnly } from "@/shared/store-rules/DigitalOnly";

export default function Screen() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  return useIsAuthed() ? <DigitalOnly><GiftsPage code={code} /></DigitalOnly> : <Redirect href="/auth/login" />;
}
