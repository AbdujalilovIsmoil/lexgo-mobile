import type { Ref } from "react";
import { View } from "react-native";
import { Button, Segmented, Text } from "@/shared/ui";
import { SearchBox } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import type { TicketTab } from "@/entities/support";

// `newBox`: the new-chat button as a remote-assistance control (measured for the operator's outline).
type Props = { tab: TicketTab; onTab: (t: TicketTab) => void; query: string; onQuery: (q: string) => void; filters: boolean; counts: Record<TicketTab, string>; onNew: () => void; newBox?: { ref: Ref<View>; collapsable: false } };

// "My chats" header: title + lead + the new-chat button, a sliding Active / Finished switch with counts, and a search.
export function ListControls({ tab, onTab, query, onQuery, filters, counts, onNew, newBox }: Props) {
  const { t } = useT();
  return (
    <View style={{ gap: 12, marginBottom: 12, marginTop: 4 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="h3">{t("sp1.listTitle")}</Text>
          <Text variant="caption" tone="gray">{t("sp1.listLead")}</Text>
        </View>
        <View {...newBox}><Button title={t("sp1.newTicket")} variant="soft" size="sm" icon="plus" onPress={onNew} /></View>
      </View>
      {filters ? (
        <>
          <Segmented<TicketTab> options={[{ value: "active", label: `${t("sp1.tabActive")}${counts.active}` }, { value: "closed", label: `${t("sp1.tabClosed")}${counts.closed}` }]} value={tab} onChange={onTab} />
          <View style={{ marginHorizontal: -16 }}><SearchBox value={query} onChangeText={onQuery} placeholder={t("sp1.searchPh")} /></View>
        </>
      ) : null}
    </View>
  );
}
