import { Redirect } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { PaymentsPage } from "@/pages/payments/PaymentsPage";

export default function Screen() {
  return useIsAuthed() ? <PaymentsPage /> : <Redirect href="/auth/login" />;
}
