import { ScrollView } from "react-native";
import { AdminPage } from "@/shared/ui/admin";
import { ClientHeader, MineSection } from "@/widgets/urgent";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

// /urgent — Tezkor advokat for the client: the hero and the service list from the catalog then "Mening so'rovlarim" (the whole list: /urgent/requests).
export default function UrgentPage() {
  const { t } = useT();
  const insets = useInsets();
  return (
    <AdminPage title={t("ug1.title")}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <ClientHeader />
        <MineSection />
      </ScrollView>
    </AdminPage>
  );
}
