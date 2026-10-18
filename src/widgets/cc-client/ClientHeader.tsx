import { StyleSheet, View } from "react-native";
import { useCcLabel, type CcClient } from "@/entities/admin-callcenter";
import { Avatar, Card, Text } from "@/shared/ui";
import { StatusPill } from "@/shared/ui/admin";
import { fmtDate } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

// Who the client is: name, LexGo ID, phone, account state and since when.
export function ClientHeader({ client, createdAt }: { client: Pick<CcClient, "name" | "phone" | "lexgoId" | "status">; createdAt?: string }) {
  const { t, locale } = useT();
  const label = useCcLabel();
  const name = client.name || client.phone || "—";
  return (
    <Card style={s.card}>
      <Avatar name={name} size={54} />
      <View style={s.col}>
        <Text variant="h4" numberOfLines={2}>{name}</Text>
        {client.lexgoId ? <Text variant="caption" tone="gray" selectable>{client.lexgoId}</Text> : null}
        {client.phone && client.name ? <Text variant="small" tone="gray" selectable>{client.phone}</Text> : null}
        {createdAt ? <Text variant="caption" tone="gray2">{t("admCcB.since", { date: fmtDate(createdAt, locale) })}</Text> : null}
      </View>
      {client.status ? <StatusPill status={client.status} label={label("admCcC.clStatus", client.status)} /> : null}
    </Card>
  );
}

const s = StyleSheet.create({ card: { flexDirection: "row", alignItems: "center", gap: 14 }, col: { flex: 1, gap: 2 } });
