import { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { MessageRow, chatHref, useLive, useMessagesPaged, useNames, type Message } from "@/entities/admin-hrm";
import { useSession } from "@/entities/session";
import { ComposeBar, MessageComposer } from "@/widgets/admin-hrm";
import type { Recipient } from "@/features/admin-hrm";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { CcTiles } from "@/shared/ui/cc";
import { IconButton } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Box = "all" | "unread" | "sent";

// Internal messages: inbox / unread / sent (server pages, live refresh), read in full, reply or write a new one.
export default function MyMessagesPage() {
  const { t } = useT();
  const me = useSession()?.user.id ?? "";
  const names = useNames();
  const router = useRouter();
  const [box, setBox] = useState<Box>("all");
  const [compose, setCompose] = useState(false);
  const [to, setTo] = useState<Recipient | null>(null);
  const { items: all, query: paged } = useMessagesPaged(box === "unread");
  const items = useMemo(() => (box === "sent" ? all.filter((m) => m.senderId === me) : all), [all, box, me]);
  const unread = items.filter((m) => m.senderId !== me && !m.readAt && m.status !== "read").length;
  useLive();
  const write = (peer: Recipient | null) => { setTo(peer); setCompose(true); };
  const options = (["all", "unread", "sent"] as const).map((k) => ({ value: k as string, label: t(`admHrm.box.${k}`), ...(k === "unread" && unread ? { count: unread } : {}), alert: k === "unread" }));
  // A message opens the whole conversation with that colleague (chat), not a single message sheet.
  const show = useCallback((m: Message) => { const peer = m.senderId === me ? m.recipientId : m.senderId; router.push(chatHref(peer, names.user(peer)) as never); }, [me, names, router]);
  return (
    <AdminPage title={t("admHrm.nav.messages")} subtitle={t("admHrmB.navDesc.messages")} footer={<ComposeBar onPress={() => write(null)} />} right={<IconButton icon="edit-3" onPress={() => write(null)} label={t("admHrm.newMessage")} />}>
      <PagedList
        data={items} query={paged} keyExtractor={(x) => x.id} renderItem={(x, i) => <MessageRow index={i} item={x} me={me} who={names.user(x.senderId === me ? x.recipientId : x.senderId)} onPress={show} />}
        empty={{ icon: "mail", title: t("admHrm.noMessages") }} header={<View style={{ marginHorizontal: -16, marginBottom: 10 }}><CcTiles options={options} value={box} onChange={(v) => setBox(v as Box)} /></View>}
      />
      <MessageComposer visible={compose} onClose={() => setCompose(false)} preset={to} />
    </AdminPage>
  );
}
