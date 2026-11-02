import { Redirect } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { EntitlementsPage } from "@/pages/subscription/EntitlementsPage";
import { DigitalOnly } from "@/shared/store-rules/DigitalOnly";

export default function Screen() {
  return useIsAuthed() ? <DigitalOnly><EntitlementsPage /></DigitalOnly> : <Redirect href="/auth/login" />;
}
