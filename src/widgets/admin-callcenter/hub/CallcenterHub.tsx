import { Children, useState, type ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useAccess } from "@/entities/access";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { SearchBox } from "@/shared/ui/admin";
import { HubHero } from "./HubHero";
import { BoardCard, CallsCard, ClientsCard, ComplaintsCard, QueueCard, UrgentCard } from "./HubCards";

export type Panel = "queue" | "urgent" | "complaints" | "board" | "clients" | "calls";

// Landing of the call-center module: a live hero, a client search that jumps straight to the lookup, and one tappable card per panel. Staff-only panels
// (queue, urgent, complaints, calls) are hidden from admins, who the backend would answer with 403.
export function CallcenterHub({ onOpen }: { onOpen: (p: Panel, q?: string) => void }) {
  const { t } = useT();
  const [q, setQ] = useState("");
  const { callCenter } = useAccess();
  const insets = useInsets();
  const pick = (p: Panel) => () => onOpen(p);
  const cards: ReactNode[] = [
    ...(callCenter ? [<QueueCard key="q" index={0} onPress={pick("queue")} />, <UrgentCard key="u" index={1} onPress={pick("urgent")} />, <ComplaintsCard key="c" index={2} onPress={pick("complaints")} />] : []),
    <BoardCard key="b" index={3} onPress={pick("board")} />,
    <ClientsCard key="cl" index={4} onPress={pick("clients")} />,
    ...(callCenter ? [<CallsCard key="ca" index={5} onPress={pick("calls")} />] : []),
  ];
  const rows = Children.toArray(cards);
  return (
    <ScrollView contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
      <HubHero />
      <View style={s.search}><SearchBox value={q} onChangeText={setQ} placeholder={t("admCcH.findClient")} onSubmit={() => q.trim().length >= 2 && onOpen("clients", q.trim())} /></View>
      {Array.from({ length: Math.ceil(rows.length / 2) }, (_, i) => rows.slice(i * 2, i * 2 + 2)).map((r, i) => (
        <View key={i} style={s.row}>{r}{r.length === 1 ? <View style={s.fill} /> : null}</View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({ body: { paddingHorizontal: 16, gap: 12, paddingTop: 4 }, row: { flexDirection: "row", gap: 12 }, fill: { flex: 1 }, search: { marginHorizontal: -16 } });
