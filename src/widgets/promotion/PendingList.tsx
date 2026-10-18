import type { PendingPromo } from "@/entities/promotion";
import { Pill } from "@/shared/ui";
import { RowCard, SectionCard } from "@/shared/ui/admin";
import { Notice } from "@/shared/ui/sel";
import { useSom } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";

// Checkouts that wait for the Telegram approval. They stay "pending" until the server says otherwise (TZ 27, 45.5).
export function PendingList({ items }: { items: PendingPromo[] }) {
  const { t } = useT();
  const som = useSom();
  if (!items.length) return null;
  return (
    <SectionCard title={t("sl10.pending.title")}>
      <Notice text={t("sl10.pending.text")} icon="clock" />
      {items.map((p) => (
        <RowCard key={`${p.target}-${p.at}`} icon="clock" tint="#F59E0B" title={p.packageTitle} subtitle={[t(p.target.startsWith("service:") ? "sl11.placement.service_boost" : `sl11.placement.${p.target}`), som(p.amount)].join(" · ")} right={<Pill label={t(p.telegramSent ? "sl10.pending.waiting" : "sl10.pending.notSent")} tone={p.telegramSent ? "warn" : "err"} small />} />
      ))}
    </SectionCard>
  );
}
