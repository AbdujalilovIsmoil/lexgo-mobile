import { useState } from "react";
import { View } from "react-native";
import { REQUIRED_SLUGS, readyCount, useDocs } from "@/entities/admin-legal";
import { DocsTab, JournalTab } from "@/widgets/admin-legal";
import { AdminPage, ChipBar } from "@/shared/ui/admin";
import { IconButton } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Tab = "docs" | "journal";

// Legal documents (10 required slugs, versions, publishing) and the consents journal.
export default function AdminLegalPage() {
  const { t } = useT();
  const [tab, setTab] = useState<Tab>("docs");
  const [creating, setCreating] = useState(false);
  const docs = useDocs();
  const tabs = [{ value: "docs" as Tab, label: t("admLegal.tabDocs") }, { value: "journal" as Tab, label: t("admLegal.tabJournal") }];
  return (
    <AdminPage
      title={t("admHub.mod.legal.title")}
      subtitle={docs.data ? t("admLegal.readiness", { n: readyCount(docs.data), total: REQUIRED_SLUGS.length }) : undefined}
      right={tab === "docs" ? <IconButton icon="plus" label={t("admLegal.newDoc")} onPress={() => setCreating(true)} /> : undefined}
    >
      <View style={{ paddingBottom: 6 }}><ChipBar options={tabs} value={tab} onChange={setTab} /></View>
      {tab === "docs" ? <DocsTab newDoc={creating} onNewHandled={() => setCreating(false)} /> : <JournalTab />}
    </AdminPage>
  );
}
