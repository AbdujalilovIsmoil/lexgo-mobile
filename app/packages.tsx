import { Redirect } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { PackagesPage } from "@/pages/packages/PackagesPage";

export default function Screen() {
  return useIsAuthed() ? <PackagesPage /> : <Redirect href="/auth/login" />;
}
