import { EventRow, useLocalPaged, useSecurityEvents } from "@/entities/security";
import { Text } from "@/shared/ui";
import { PagedList } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { KindBar, type HistoryKind } from "./KindBar";

// Security events: sign-ins from a new IP or device and similar alerts.
export function EventsList({ onKind }: { onKind: (k: HistoryKind) => void }) {
  const { t } = useT();
  const q = useSecurityEvents();
  const { items, query } = useLocalPaged(q.data ?? [], q);
  return (
    <PagedList
      data={items}
      query={query}
      keyExtractor={(e) => e.id}
      renderItem={(e) => <EventRow item={e} />}
      empty={{ icon: "shield", title: t("admSecC.evEmpty"), text: t("admSecC.evEmptyText") }}
      header={<><KindBar value="events" onChange={onKind} /><Text variant="small" tone="gray" style={{ marginVertical: 10 }}>{t("admSecC.evLead")}</Text></>}
    />
  );
}
