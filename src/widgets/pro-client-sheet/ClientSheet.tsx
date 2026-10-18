import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useClientDetail, useStartChat } from "@/entities/pro-clients";
import { useSession } from "@/entities/session";
import { useT } from "@/shared/i18n";
import { openTel } from "@/shared/lib/links";
import { useKept } from "@/shared/lib/useKept";
import { useSheetNavigate } from "@/shared/lib/useSheetNavigate";
import { ApiError } from "@/shared/api";
import { BottomSheet, ErrorView, SheetScroll, Skeleton, Text } from "@/shared/ui";
import { ChipBar } from "@/shared/ui/admin";
import { ClientHero } from "./ClientHero";
import { ContactCard } from "./ContactCard";
import { CaseSheet } from "@/widgets/pro-case-detail";
import { LinkedList } from "./LinkedList";
import { QuickActions, type QuickAction } from "./QuickActions";

type Tab = "timeline" | "cases" | "orders" | "payments" | "documents";
const TABS: Tab[] = ["timeline", "cases", "orders", "payments", "documents"];

// Client card: who they are, the quick actions (call, chat), contact facts and the shared history in chips.
export function ClientSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { t } = useT();
  const router = useRouter();
  const kept = useKept(id);
  const q = useClientDetail(kept ?? "");
  const [tab, setTab] = useState<Tab>("timeline");
  const [caseId, setCaseId] = useState<string | null>(null); // a case opens as a sheet on top of this one, not as a page
  const go = useSheetNavigate(onClose);
  const me = useSession()?.user.id ?? "";
  const start = useStartChat();
  const d = q.data;
  const items: (QuickAction | null)[] = d
    ? [
        d.phone ? { key: "call", icon: "phone", label: t("aw3.callPhone"), onPress: () => openTel(d.phone) } : null,
        d.chats[0] || !d.manual
          ? {
              key: "chat", icon: "message-circle", label: t("aw3.chat"), loading: start.isPending,
              onPress: () => (d.chats[0] ? go(() => router.push(`/chat/${d.chats[0].id}` as never)) : start.mutate({ clientId: d.id, sellerId: me }, { onSuccess: (room) => room && go(() => router.push(`/chat/${room}` as never)) })),
            }
          : null,
      ]
    : [];
  const actions = items.filter((x): x is QuickAction => !!x);
  return (
    <BottomSheet visible={!!id} onClose={onClose} title={t("aw3.card")} snaps={[0.78, 0.95]}>
      <SheetScroll>
        {q.isLoading ? (
          <View style={{ gap: 14 }}>
            <Skeleton height={64} round={20} />
            <Skeleton height={84} round={14} />
            <Skeleton height={150} round={20} />
          </View>
        ) : q.isError ? (
          q.error instanceof ApiError && q.error.status === 404 ? <Text variant="small" tone="gray" center>{t("aw3.notFound")}</Text> : <ErrorView error={q.error} onRetry={() => void q.refetch()} compact />
        ) : d ? (
          <>
            <ClientHero d={d} />
            <QuickActions actions={actions} />
            <ContactCard d={d} />
            <View style={s.history}>
              <Text variant="h4">{t("aw3.history")}</Text>
              <View style={s.tabs}>
                <ChipBar options={TABS.map((x) => ({ value: x, label: t(`aw3.tab.${x}`), count: d[x].length || undefined }))} value={tab} onChange={setTab} />
              </View>
              <LinkedList rows={d[tab]} icon={{ timeline: "clock", cases: "briefcase", orders: "shopping-bag", payments: "credit-card", documents: "file-text" }[tab] as "clock"} onOpen={tab === "cases" ? (cid) => setCaseId(cid) : tab === "orders" ? (oid) => go(() => router.push(`/pro/orders/${oid}` as never)) : undefined} />
            </View>
          </>
        ) : null}
      </SheetScroll>
      <CaseSheet id={caseId} onClose={() => setCaseId(null)} />
    </BottomSheet>
  );
}

// The chip row scrolls edge to edge: it cancels the sheet gutter (18) and brings its own (16).
const s = StyleSheet.create({ history: { gap: 12 }, tabs: { marginHorizontal: -18 } });
