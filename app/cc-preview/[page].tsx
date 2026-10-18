// TEMP (CC package verification only): renders the call-center tab pages as stack routes so a superadmin can open them.
import { useLocalSearchParams } from "expo-router";
import { CcClientsPage } from "@/pages/cc-clients/CcClientsPage";
import { CcLeadsPage } from "@/pages/cc-leads/CcLeadsPage";
import { CcMeetingsPage } from "@/pages/cc-meetings/CcMeetingsPage";
import { CcSupportPage } from "@/pages/cc-support/CcSupportPage";

export default function Preview() {
  const { page } = useLocalSearchParams<{ page: string }>();
  if (page === "support") return <CcSupportPage />;
  if (page === "clients") return <CcClientsPage />;
  if (page === "meetings") return <CcMeetingsPage />;
  return <CcLeadsPage />;
}
