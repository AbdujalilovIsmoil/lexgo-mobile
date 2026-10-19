import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useAccess } from "@/entities/access";
import { BoardPanel, ClientsPanel } from "@/widgets/admin-callcenter";
import { TabPage, useTabPad } from "@/widgets/tab-page";
import { Segmented } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Mode = "leads" | "clients";

// The web's "Navbatchi xizmat" for a sales operator: two tabs — the leads board, and client search with the business hours
// (open only to duty-desk staff; others get the same "no access" note as on the web).
export function SalesDutyPage() {
  const { t } = useT();
  const pad = useTabPad();
  const { callCenter } = useAccess();
  const [mode, setMode] = useState<Mode>("leads");
  return (
    <TabPage title={t("admHub.mod.callcenter.title")} subtitle={t("salesOp.dutySub")}>
      <View style={s.bar}>
        <Segmented options={[{ value: "leads", label: t("salesOp.dutyLeads") }, { value: "clients", label: t("salesOp.dutyClients") }]} value={mode} onChange={setMode} />
      </View>
      <View style={s.fill}>{mode === "leads" ? <BoardPanel bottomPad={pad} /> : <ClientsPanel canLog={callCenter} bottomPad={pad} />}</View>
    </TabPage>
  );
}

const s = StyleSheet.create({ bar: { paddingHorizontal: 16, paddingBottom: 10 }, fill: { flex: 1 } });
