import { Redirect, useLocalSearchParams } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { PaymentDetailPage } from "@/pages/payments/PaymentDetailPage";

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return useIsAuthed() ? <PaymentDetailPage id={id} /> : <Redirect href="/auth/login" />;
}
