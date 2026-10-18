import { useLocalSearchParams } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { ChatsKind, DocsKind, OrdersKind, PaymentsKind, WorksKind } from "@/widgets/dashboard-lists";
import { WorksGuest } from "@/widgets/works";
import { EmptyState } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

const KINDS = { works: WorksKind, documents: DocsKind, orders: OrdersKind, payments: PaymentsKind, chats: ChatsKind } as const;

// /dashboard-lists/[kind] — the filtered list behind a Home counter (TZ 7).
export function DashboardListPage() {
  const { t } = useT();
  const { kind } = useLocalSearchParams<{ kind: string }>();
  const authed = useIsAuthed();
  const Body = kind && kind in KINDS ? KINDS[kind as keyof typeof KINDS] : null;
  return (
    <AdminPage title={Body ? t(`cl7.kinds.${kind}.title`) : t("cl7.unknown")} subtitle={Body ? t(`cl7.kinds.${kind}.sub`) : undefined}>
      {!authed ? <WorksGuest /> : Body ? <Body /> : <EmptyState icon="help-circle" title={t("cl7.unknown")} text={t("cl7.unknownText")} />}
    </AdminPage>
  );
}
