import { useState } from "react";
import { View } from "react-native";
import { useAccess } from "@/entities/access";
import { BoardPanel, CallcenterHub, CallsPanel, ClientsPanel, ComplaintsPanel, QueuePanel, UrgentPanel, type Panel } from "@/widgets/admin-callcenter";
import { AdminPage } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// Call-center console: a live hub first, tapping a card opens that panel (back returns to the hub).
export default function AdminCallcenterPage() {
  const { t } = useT();
  const { callCenter } = useAccess();
  const [panel, setPanel] = useState<Panel | null>(null);
  const [q, setQ] = useState("");
  const open = (p: Panel, term = "") => { setQ(term); setPanel(p); };
  return (
    <AdminPage title={panel ? t(`admCc.pg.${panel}`) : t("admHub.mod.callcenter.title")} onBack={panel ? () => setPanel(null) : undefined}>
      {panel === null ? <CallcenterHub onOpen={open} /> : (
        <View style={{ flex: 1, paddingTop: 8 }}>
          {panel === "queue" ? <QueuePanel onOpenUrgent={() => setPanel("urgent")} /> : null}
          {panel === "urgent" ? <UrgentPanel /> : null}
          {panel === "complaints" ? <ComplaintsPanel /> : null}
          {panel === "board" ? <BoardPanel /> : null}
          {panel === "clients" ? <ClientsPanel canLog={callCenter} initial={q} /> : null}
          {panel === "calls" ? <CallsPanel /> : null}
        </View>
      )}
    </AdminPage>
  );
}
