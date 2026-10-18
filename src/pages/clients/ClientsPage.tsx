import { useState } from "react";
import type { ProClient } from "@/entities/pro-clients";
import { ClientFormSheet, ConflictSheet } from "@/features/pro-client-form";
import { useT } from "@/shared/i18n";
import { TabPage, useTabPad } from "@/widgets/tab-page";
import { ClientList } from "@/widgets/pro-client-list";
import { ClientSheet } from "@/widgets/pro-client-sheet";

// Mijozlar tab: roster derived from cases / orders / documents, client card sheet, own-base clients, conflict check.
export function ClientsPage() {
  const { t } = useT();
  const pad = useTabPad();
  const [open, setOpen] = useState<string | null>(null);
  const [add, setAdd] = useState(false);
  const [check, setCheck] = useState(false);
  return (
    <TabPage title={t("tabs.clients")} subtitle={t("aw3.sub")}>
      <ClientList bottomPad={pad} onOpen={(c: ProClient) => setOpen(c.id)} onAdd={() => setAdd(true)} onCheck={() => setCheck(true)} />
      <ClientSheet id={open} onClose={() => setOpen(null)} />
      <ClientFormSheet visible={add} onClose={() => setAdd(false)} />
      <ConflictSheet visible={check} onClose={() => setCheck(false)} />
    </TabPage>
  );
}
