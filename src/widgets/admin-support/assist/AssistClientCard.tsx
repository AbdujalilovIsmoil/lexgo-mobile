import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { SupportStatusPill, ticketTitle, useSupportLabels, type AssistContext, type CallKind, type SupportTicket } from "@/entities/admin-support";
import { Avatar, Button, Card, Pill, PressableScale, Text } from "@/shared/ui";
import { openTel } from "@/shared/lib/links";
import { humanizeSlug } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

type Props = { ctx: AssistContext; ticket: SupportTicket; onCall?: (k: CallKind) => void; calling: CallKind | "" };

// Who the client is (name, LexGo ID, phone, role, account state), the ticket in one line and the call buttons.
export function AssistClientCard({ ctx, ticket, onCall, calling }: Props) {
  const { t } = useT();
  const labels = useSupportLabels();
  const router = useRouter();
  const c = ctx.client;
  const name = c?.name || ticket.clientName;
  const lexgoId = c?.lexgoId || ticket.clientLexgoId;
  const account = c?.accountStatus && c.accountStatus !== "active" ? c.accountStatus : "";
  return (
    <Card style={s.card}>
      <View style={s.who}>
        <Avatar name={name || "?"} size={46} />
        <View style={s.col}>
          <Text variant="body" weight="bold">{name || t("admSupB.client.noName")}</Text>
          {lexgoId ? <Text variant="caption" tone="gray">LexGo ID: {lexgoId}</Text> : null}
          {c?.phone ? <PressableScale onPress={() => openTel(c.phone)}><Text variant="small" tone="accent" weight="semibold">{c.phone}</Text></PressableScale> : null}
        </View>
      </View>
      <View style={s.line}>
        <Pill label={labels.role(c?.role || "client")} tone="gray" small />
        {account ? <Pill label={t("admSupB.client.account", { status: humanizeSlug(account) })} tone="warn" small /> : null}
        <SupportStatusPill status={ticket.status} />
      </View>
      <Text variant="small" tone="gray">{[ticket.workId, labels.category(ticket.category)].filter(Boolean).join(" · ")}</Text>
      <Text variant="small">{ticketTitle(ticket, t("admSup.untitled"))}</Text>
      {c?.id ? <Button title={t("cc2.openCard")} icon="user" size="sm" variant="soft" onPress={() => router.push({ pathname: "/cc/clients/[id]", params: { id: c.id, name: c.name, phone: c.phone } } as never)} /> : null}
      {onCall && ctx.caps.supportCall ? (
        <View style={s.line}>
          <Button title={calling === "audio" ? t("admSup.calling") : t("admSupB.client.audio")} icon="phone" size="sm" variant="line" onPress={() => onCall("audio")} disabled={!!calling} />
          <Button title={calling === "video" ? t("admSup.calling") : t("admSupB.client.video")} icon="video" size="sm" variant="line" onPress={() => onCall("video")} disabled={!!calling} />
        </View>
      ) : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 10 },
  who: { flexDirection: "row", alignItems: "center", gap: 12 },
  col: { flex: 1, gap: 2 },
  line: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
});
