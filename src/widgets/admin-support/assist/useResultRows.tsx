import { StatusPill, type Fact } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// Rows every result card shares: the work id, Telegram delivery and the backend status.
export function useResultRows() {
  const { t } = useT();
  return {
    work: (id: string): Fact => ({ label: t("admSupB.result.workId"), value: id || "—" }),
    tg: (ok: boolean): Fact => ({ label: "Telegram", value: ok ? t("admSupB.result.tgSent") : t("admSupB.result.tgFailed") }),
    status: (s: string): Fact => ({ label: t("adm.status"), value: s ? <StatusPill status={s} /> : "" }),
  };
}
