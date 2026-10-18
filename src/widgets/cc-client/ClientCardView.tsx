import { View } from "react-native";
import { ApiError } from "@/shared/api";
import { useClientCard } from "@/entities/admin-callcenter";
import { ErrorView, Skeleton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { ClientActions } from "./ClientActions";
import { ClientHeader } from "./ClientHeader";
import { ClientKpis } from "./ClientKpis";
import { ClientSubs } from "./ClientSubs";
import { ClientTabs } from "./ClientTabs";

type Props = { id: string; hint: { name: string; phone: string } };

// The client card (360): header + reach-out actions on top, then totals, subscriptions and the history tabs.
// When the account may not read the full card (403) the header still shows what the search knew, with a note.
export function ClientCardView({ id, hint }: Props) {
  const { t } = useT();
  const q = useClientCard(id);
  const denied = q.error instanceof ApiError && q.error.status === 403;
  const card = q.data;
  const client = card?.client ?? { id, name: hint.name, phone: hint.phone, lexgoId: "", status: "" };
  if (q.isLoading) return <View style={{ gap: 12 }}><Skeleton height={90} round={20} /><Skeleton height={150} round={20} /><Skeleton height={120} round={20} /></View>;
  if (q.isError && !denied) return <ErrorView error={q.error} onRetry={() => void q.refetch()} />;
  return (
    <View style={{ gap: 14 }}>
      <ClientHeader client={client} createdAt={card?.client.createdAt} />
      <ClientActions id={id} name={client.name} phone={client.phone} />
      {denied ? <Text variant="small" tone="gray">{t("admCcC.cardNoAccess")}</Text> : null}
      {card ? (
        <>
          <ClientKpis card={card} />
          <ClientSubs subs={card.subs} />
          <ClientTabs card={card} />
        </>
      ) : null}
    </View>
  );
}
