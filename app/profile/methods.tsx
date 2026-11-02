import { Redirect } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { MethodsPage } from "@/pages/profile-extras/MethodsPage";
import { DigitalOnly } from "@/shared/store-rules/DigitalOnly";

export default function Screen() {
  return useIsAuthed() ? <DigitalOnly><MethodsPage /></DigitalOnly> : <Redirect href="/auth/login" />;
}
