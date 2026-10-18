import { ScrollView } from "react-native";
import { HubGrid, HubHeader } from "@/widgets/admin-hrm";
import { AdminPage } from "@/shared/ui/admin";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

// /manage/internal and the HRM tab — live launcher: greeting header and the sections this user may open, with live badges.
export default function HubPage({ tab }: { tab?: boolean }) {
  const { t } = useT();
  const insets = useInsets();
  return (
    <AdminPage hideBack={tab} title={t("admHub.mod.internal.title")} subtitle={t("admHrm.hubLead")}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + (tab ? 130 : 24) }} showsVerticalScrollIndicator={false}>
        <HubHeader />
        <HubGrid />
      </ScrollView>
    </AdminPage>
  );
}
