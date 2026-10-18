import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useClientDetail, useStartChat } from "@/entities/pro-clients";
import { useSession } from "@/entities/session";
import { RequestDocSheet } from "@/features/pro-client-form";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { openTel } from "@/shared/lib/links";
import { useKept } from "@/shared/lib/useKept";
import { useSheetNavigate } from "@/shared/lib/useSheetNavigate";
import { ApiError } from "@/shared/api";
import { Avatar, BottomSheet, Button, ErrorView, Segmented, SheetScroll, Skeleton, Text } from "@/shared/ui";
import { LinkedList } from "./LinkedList";

type Tab = "timeline" | "cases" | "orders" | "payments" | "documents";
const TABS: Tab[] = ["timeline", "cases", "orders", "payments", "documents"];

// Client card: contact, notes, actions (chat, call, request a document) and the shared history in tabs.
export function ClientSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { t, locale } = useT();
  const router = useRouter();
  const kept = useKept(id);
  const q = useClientDetail(kept ?? "");
  const [tab, setTab] = useState<Tab>("timeline");
  const [req, setReq] = useState(false);
  const go = useSheetNavigate(onClose);
  const me = useSession()?.user.id ?? "";
  const start = useStartChat();
  const d = q.data;
  return (
    <BottomSheet visible={!!id} onClose={onClose} title={d?.name || t("aw3.title")} snaps={[0.72, 0.95]}>
      <SheetScroll>
        {q.isLoading ? <Skeleton height={160} round={20} /> : q.isError ? (q.error instanceof ApiError && q.error.status === 404 ? <Text variant="small" tone="gray" center>{t("aw3.notFound")}</Text> : <ErrorView error={q.error} onRetry={() => void q.refetch()} compact />) : d ? (
          <>
            <View style={s.head}>
              <Avatar name={d.name || "?"} size={52} />
              <View style={{ flex: 1 }}>
                <Text variant="body" weight="bold">{d.name}</Text>
                <Text variant="small" tone="gray">{[d.phone, d.company, d.region].filter(Boolean).join(" · ")}</Text>
                {d.createdAt ? <Text variant="caption" tone="gray2">{t("aw3.since", { date: fmtDate(d.createdAt, locale) })}</Text> : null}
              </View>
            </View>
            {d.notes ? <Text variant="small" tone="gray">{d.notes}</Text> : null}
            <View style={s.actions}>
              {d.phone ? <Button title={t("aw3.callPhone")} icon="phone" size="sm" variant="soft" onPress={() => openTel(d.phone)} /> : null}
              {d.chats[0] || !d.manual ? <Button title={t("aw3.chat")} icon="message-circle" size="sm" variant="soft" loading={start.isPending} onPress={() => (d.chats[0] ? go(() => router.push(`/chat/${d.chats[0].id}` as never)) : start.mutate({ clientId: d.id, sellerId: me }, { onSuccess: (room) => room && go(() => router.push(`/chat/${room}` as never)) }))} /> : null}
              {!d.manual ? <Button title={t("aw3.reqDoc")} icon="file-plus" size="sm" variant="soft" onPress={() => setReq(true)} /> : null}
            </View>
            <Segmented options={TABS.map((x) => ({ value: x, label: `${t(`aw3.tab.${x}`)}${d[x].length ? ` ${d[x].length}` : ""}` }))} value={tab} onChange={setTab} />
            <LinkedList rows={d[tab]} icon={{ timeline: "clock", cases: "briefcase", orders: "shopping-bag", payments: "credit-card", documents: "file-text" }[tab] as "clock"} onOpen={tab === "cases" ? (cid) => go(() => router.push(`/pro/cases/${cid}` as never)) : tab === "orders" ? (oid) => go(() => router.push(`/pro/orders/${oid}` as never)) : undefined} />
            <RequestDocSheet visible={req} onClose={() => setReq(false)} clientId={d.id} clientName={d.name} />
          </>
        ) : null}
      </SheetScroll>
    </BottomSheet>
  );
}

const s = StyleSheet.create({ head: { flexDirection: "row", alignItems: "center", gap: 12 }, actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 } });
