import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { LeadScopeProvider } from "@/entities/admin-leads";
import { QueuePanel } from "@/widgets/admin-callcenter";
import { LeadsScreen } from "@/widgets/admin-leads";
import { CcToolsButton } from "@/widgets/cc-tools";
import { TabPage, useTabPad } from "@/widgets/tab-page";
import { Segmented } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Mode = "board" | "queue";

// Leadlar tab: the sales funnel (stages, filters, create / edit / move, timeline, Excel) on the call-center endpoints,
// and the SLA work queue (leads, unassigned orders, urgent requests) next to it.
export function CcLeadsPage() {
  const { t } = useT();
  const router = useRouter();
  const pad = useTabPad();
  const [view, setView] = useState<Mode>("board");
  return (
    <LeadScopeProvider value="cc">
      <LeadsScreen
        bottomPad={pad}
        frame={({ actions, children }) => (
          <TabPage title={t("tabs.leads")} subtitle={t("cc1.leads.sub")} right={<CcToolsButton />}>
            <View style={s.bar}>
              <View style={s.fill}><Segmented options={[{ value: "board", label: t("cc1.leads.board") }, { value: "queue", label: t("cc1.leads.queue") }]} value={view} onChange={setView} /></View>
              {view === "board" ? <View style={s.actions}>{actions}</View> : null}
            </View>
            {view === "board" ? children : <QueuePanel bottomPad={pad} onOpenUrgent={() => router.push("/cc/urgent" as never)} />}
          </TabPage>
        )}
      />
    </LeadScopeProvider>
  );
}

const s = StyleSheet.create({ bar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 10 }, fill: { flex: 1 }, actions: { flexDirection: "row", gap: 6 } });
