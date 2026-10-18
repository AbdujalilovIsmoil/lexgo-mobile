import { useState } from "react";
import { View } from "react-native";
import { useAccess } from "@/entities/access";
import type { B2bClient } from "@/entities/admin-b2b";
import { PipelineView, ProductsView, TasksView, TimelineSheet } from "@/widgets/admin-b2b";
import { AdminPage } from "@/shared/ui/admin";
import { IconButton, Segmented } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { ClientsTab } from "./ClientsTab";

type Tab = "clients" | "pipeline" | "tasks" | "products";

// B2B: corporate clients (documents, history), the sales pipeline, the clients' tasks and the product list.
export default function AdminB2bPage() {
  const { t } = useT();
  const canManage = useAccess().can("b2b.manage");
  const [tab, setTab] = useState<Tab>("clients");
  const [adding, setAdding] = useState(false);
  const [history, setHistory] = useState<{ id: string; name: string } | null>(null);
  const tabs = (["clients", "pipeline", "tasks", "products"] as const).map((k) => ({ value: k, label: t(`admB2bB.tab.${k}`) }));
  const open = (c: Pick<B2bClient, "id" | "name">) => setHistory({ id: c.id, name: c.name });
  return (
    <AdminPage title={t("admHub.mod.b2b.title")} right={tab === "clients" && canManage ? <IconButton icon="plus" size={40} label={t("adm.add")} onPress={() => setAdding(true)} /> : undefined}>
      <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}><Segmented options={tabs} value={tab} onChange={setTab} /></View>
      {tab === "clients" ? <ClientsTab adding={adding} onAdded={() => setAdding(false)} onTimeline={open} /> : null}
      {tab === "pipeline" ? <PipelineView onOpen={open} /> : null}
      {tab === "tasks" ? <TasksView /> : null}
      {tab === "products" ? <ProductsView /> : null}
      <TimelineSheet target={history} onClose={() => setHistory(null)} />
    </AdminPage>
  );
}
