import { useState } from "react";
import { useRouter } from "expo-router";
import type { ProClient } from "@/entities/pro-clients";
import { ConflictSheet } from "@/features/pro-client-form";
import { useT } from "@/shared/i18n";
import { TabPage, useTabPad } from "@/widgets/tab-page";
import { ClientList } from "@/widgets/pro-client-list";

// Mijozlar tab: roster derived from cases / orders / documents, own-base clients and the conflict check. A client opens their card page
// (/pro/clients/[id]); "Yangi mijoz" opens its own page (/pro/clients/new).
export function ClientsPage() {
  const { t } = useT();
  const router = useRouter();
  const pad = useTabPad();
  const [check, setCheck] = useState(false);
  return (
    <TabPage navy title={t("tabs.clients")} subtitle={t("aw3.sub")}>
      <ClientList bottomPad={pad} onOpen={(c: ProClient) => router.push(`/pro/clients/${encodeURIComponent(c.id)}` as never)} onAdd={() => router.push("/pro/clients/new" as never)} onCheck={() => setCheck(true)} />
      <ConflictSheet visible={check} onClose={() => setCheck(false)} />
    </TabPage>
  );
}
