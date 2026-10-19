import { useRouter } from "expo-router";
import { needsAction, useConsentDoc, type ConsentItem } from "@/entities/profile-extras";
import { useAcceptConsent } from "@/features/profile-extras";
import { FormSheet } from "@/shared/ui/admin";
import { Button, ErrorView, Skeleton, Text } from "@/shared/ui";
import { useKept } from "@/shared/lib";
import { fmtDate } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

// The full text of a legal document and the way to accept it. A consent cannot be withdrawn in the
// app (the backend has no such call): that goes through support.
export function ConsentSheet({ item, onClose }: { item: ConsentItem | null; onClose: () => void }) {
  const { t, locale } = useT();
  const router = useRouter();
  const kept = useKept(item);
  const c = item ?? kept;
  const q = useConsentDoc(item?.id ?? null);
  const accept = useAcceptConsent(onClose);
  const title = c ? (locale === "ru" && c.titleRu ? c.titleRu : c.title) : "";
  const todo = !!c && needsAction(c);
  return (
    <FormSheet
      visible={!!item}
      onClose={onClose}
      title={title}
      subtitle={c ? `${t("py7.version", { v: c.version })}${c.acceptedAt ? ` · ${t("py7.acceptedAt", { d: fmtDate(c.acceptedAt, locale) })}` : ""}` : undefined}
      submitLabel={t("py7.accept")}
      onSubmit={todo && c ? () => {
        // iOS cannot show the confirm dialog (a Modal) over this sheet (another Modal): close the sheet first.
        const v = { id: c.id, version: c.version, title };
        onClose();
        setTimeout(() => accept.confirm(v), 350);
      } : undefined}
      submitting={accept.pending}
      snaps={[0.7, 0.95]}
    >
      {q.isLoading ? <Skeleton height={220} round={16} /> : q.isError ? <ErrorView error={q.error} onRetry={() => void q.refetch()} compact /> : <Text variant="small" selectable style={{ lineHeight: 20 }}>{q.data?.body || t("py7.noText")}</Text>}
      {!todo ? (
        <>
          <Text variant="caption" tone="gray2">{t("py7.withdraw")}</Text>
          <Button title={t("py7.askSupport")} variant="line" size="sm" icon="life-buoy" onPress={() => { onClose(); router.navigate("/support?new=1" as never); }} />
        </>
      ) : null}
    </FormSheet>
  );
}
