import { ScrollView } from "react-native";
import { AdminPage } from "@/shared/ui/admin";
import { ClientHeader } from "@/widgets/urgent";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

// /urgent — Tezkor advokat for the client: the hero, the services of the catalog and the "Mening so'rovlarim" row (the list: /urgent/requests).
export default function UrgentPage() {
  const { t } = useT();
  const insets = useInsets();
  return (
    <AdminPage title={t("ug1.title")}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <ClientHeader />
      </ScrollView>
    </AdminPage>
  );
}
