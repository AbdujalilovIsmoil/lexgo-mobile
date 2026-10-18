import { useAccess } from "@/entities/access";
import type { Complaint } from "@/entities/admin-complaints";
import { FactRows, FormSheet, StatusPill } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { fmtDateTime, humanizeSlug } from "@/shared/lib/format";
import { useKept } from "@/shared/lib/useKept";
import { useRouter } from "expo-router";
import { useT } from "@/shared/i18n";

// One complaint with everything the client wrote. Resolving belongs to the call-centre quality queue (shown to those who have it).
export function ComplaintSheet({ item, onClose }: { item: Complaint | null; onClose: () => void }) {
  const { t, locale } = useT();
  const c = useKept(item);
  const router = useRouter();
  const queue = useAccess().callCenter;
  const toQueue = () => { onClose(); setTimeout(() => router.push("/cc/complaints" as never), 340); };
  return (
    <FormSheet visible={!!item} onClose={onClose} title={c?.title ?? ""} subtitle={c?.workId} onSubmit={queue ? toQueue : undefined} submitLabel={t("ag4.queue")}>
      {c ? (
        <>
          <FactRows rows={[
            { label: t("adm.status"), value: <StatusPill status={c.status} /> }, { label: t("ag4.category"), value: humanizeSlug(c.category) },
            { label: t("ag4.priority"), value: humanizeSlug(c.priority) }, { label: t("ag4.case"), value: c.caseRef },
            { label: t("adm.created"), value: fmtDateTime(c.createdAt, locale) }, { label: t("adm.updated"), value: fmtDateTime(c.updatedAt, locale) },
          ]} />
          {c.description ? <Text variant="body" selectable>{c.description}</Text> : null}
        </>
      ) : null}
    </FormSheet>
  );
}
