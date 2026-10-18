import { ClientSearch } from "@/widgets/cc-client";
import { CcToolsButton } from "@/widgets/cc-tools";
import { TabPage, useTabPad } from "@/widgets/tab-page";
import { useT } from "@/shared/i18n";

// Mijozlar tab: find a client by name / phone / LexGo ID and open the client card (/cc/clients/<id>).
export function CcClientsPage() {
  const { t } = useT();
  const pad = useTabPad();
  return (
    <TabPage title={t("tabs.clients")} subtitle={t("cc1.clients.sub")} right={<CcToolsButton />}>
      <ClientSearch bottomPad={pad} />
    </TabPage>
  );
}
