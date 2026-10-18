import { useRouter } from "expo-router";
import { SupportStatusPill, ticketTitle, useClientTickets } from "@/entities/admin-support";
import { ErrorView, Skeleton } from "@/shared/ui";
import { RowCard } from "@/shared/ui/admin";
import { timeAgo } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { MoreRows } from "../MoreRows";

// The client's support tickets (newest first); a row opens the ticket workspace.
export function TicketsTab({ clientId }: { clientId: string }) {
  const { t } = useT();
  const router = useRouter();
  const q = useClientTickets(clientId);
  if (q.isLoading) return <Skeleton height={72} round={20} />;
  if (q.isError) return <ErrorView error={q.error} onRetry={() => void q.refetch()} compact />;
  return (
    <MoreRows
      items={q.data ?? []}
      empty={t("cc2.none.tickets")}
      render={(tk) => (
        <RowCard
          key={tk.id}
          icon="headphones"
          title={ticketTitle(tk, t("admSup.untitled"))}
          subtitle={tk.workId}
          meta={timeAgo(tk.lastMessageAt || tk.updatedAt, t)}
          right={<SupportStatusPill status={tk.status} />}
          onPress={() => router.push(`/cc/assist/${encodeURIComponent(tk.id)}` as never)}
        />
      )}
    />
  );
}

