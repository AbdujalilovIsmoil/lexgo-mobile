import { Pill, type PillTone } from "@/shared/ui";
import { humanizeSlug } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

const TONE: Record<string, PillTone> = {
  paid: "blue", sent_to_seller: "blue", accepted: "cy", started: "cy", in_progress: "cy", result_ready: "cy", quality_check: "cy",
  delivered: "ok", client_confirmation: "ok", completed: "ok", rated: "ok",
  cancelled: "err", canceled: "err", declined: "err", rejected: "err", lost: "err", refunded: "gray",
};

// Backend order status as a coloured, translated pill (sl12.status.*).
export function OrderStatusPill({ status }: { status: string }) {
  const { t } = useT();
  const key = `sl12.status.${status}`;
  return <Pill label={t(key) === key ? humanizeSlug(status) : t(key)} tone={TONE[status] ?? "gray"} small />;
}
