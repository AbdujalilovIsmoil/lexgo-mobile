import { StyleSheet, View } from "react-native";
import { Pill, Text } from "@/shared/ui";
import { CcAction, CcTicket } from "@/shared/ui/cc";
import { timeAgo } from "@/shared/lib/format";
import { brand } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { isClosed, isUrgent, isWaiting, ticketTitle } from "../lib/tickets";
import { supportTint } from "../lib/tint";
import { serverIso } from "../lib/time";
import type { SupportTicket } from "../model/types";
import { SupportStatusPill } from "./SupportStatusPill";
import { useSupportLabels } from "./useLabels";
import { useWaitText } from "./useWaitText";

type Props = { item: SupportTicket; onPress: () => void; unread?: boolean; onClaim?: () => void; claiming?: boolean };

// One ticket as a ticket card: colour strip (red urgent, amber waiting), client + last message, status or unread badge,
// wait / topic / age chips and round buttons (claim is the primary one on the "new" tab, open the chat otherwise).
export function TicketRow({ item, onPress, unread, onClaim, claiming }: Props) {
  const { t } = useT();
  const labels = useSupportLabels();
  const wait = useWaitText();
  const title = ticketTitle(item, t("admSup.untitled"));
  const heading = item.clientName || title;
  const preview = item.lastMessage && !title.startsWith(item.lastMessage.slice(0, 20)) ? item.lastMessage : title;
  const waiting = isWaiting(item.status) && !isClosed(item.status);
  const n = unread ? item.unreadCount : 0;
  return (
    <CcTicket
      tint={supportTint(item)} avatar={heading} title={heading} subtitle={item.clientName ? preview : undefined} onPress={onPress}
      badge={n > 0 ? <View style={[s.badge, { backgroundColor: brand.b600 }]}><Text variant="caption" tone="white" weight="bold">{n > 99 ? "99+" : n}</Text></View> : <SupportStatusPill status={item.status} />}
      chips={<>
        {isUrgent(item.priority) ? <Pill label={t("admSup.urgent")} tone="err" icon="alert-circle" small /> : null}
        {waiting ? <Pill label={wait(item.createdAt)} tone="warn" icon="clock" small /> : null}
        {n > 0 ? <SupportStatusPill status={item.status} /> : null}
        <Pill label={[labels.category(item.category), timeAgo(serverIso(item.lastMessageAt || item.updatedAt), t)].filter(Boolean).join(" · ")} tone="gray" small />
      </>}
      actions={onClaim ? <CcAction primary icon="user-check" label={t("admSup.claim")} loading={claiming} onPress={onClaim} /> : <CcAction icon="message-circle" label={t("admSup.viewChat")} onPress={onPress} />}
    />
  );
}

const s = StyleSheet.create({ badge: { minWidth: 24, height: 24, paddingHorizontal: 6, borderRadius: 12, alignItems: "center", justifyContent: "center" } });
