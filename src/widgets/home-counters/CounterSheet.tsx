import { BottomSheet, Button, SheetScroll } from "@/shared/ui";
import { useKindNav } from "@/features/dashboard-kinds";
import { useKept } from "@/shared/lib/useKept";
import { useSheetNavigate } from "@/shared/lib/useSheetNavigate";
import { useT } from "@/shared/i18n";
import { ChatsPreview } from "./previews/ChatsPreview";
import { DocsPreview } from "./previews/DocsPreview";
import { OrdersPreview } from "./previews/OrdersPreview";
import { PaymentsPreview } from "./previews/PaymentsPreview";
import { WorksPreview } from "./previews/WorksPreview";

export type ListKind = "works" | "documents" | "orders" | "payments" | "chats";

// The drawer behind a Home counter: its first rows with real data and a button that
// opens the whole filtered list (/dashboard-lists/[kind]).
export function CounterSheet({ kind: current, onClose }: { kind: ListKind | null; onClose: () => void }) {
  const { t } = useT();
  const kind = useKept(current);
  const go = useSheetNavigate(onClose);
  const nav = useKindNav();
  return (
    <BottomSheet visible={!!current} onClose={onClose} title={kind ? t(`cl7.kinds.${kind}.title`) : ""} subtitle={kind ? t(`cl7.kinds.${kind}.sub`) : undefined}>
      <SheetScroll>
        {kind === "works" ? <WorksPreview go={go} /> : kind === "documents" ? <DocsPreview go={go} /> : kind === "orders" ? <OrdersPreview go={go} /> : kind === "payments" ? <PaymentsPreview go={go} /> : kind === "chats" ? <ChatsPreview go={go} /> : null}
        {kind ? <Button title={t("cl6.seeAll")} icon="list" variant="gradient" full style={{ marginTop: 16 }} onPress={() => go(() => nav.list(kind))} /> : null}
      </SheetScroll>
    </BottomSheet>
  );
}
