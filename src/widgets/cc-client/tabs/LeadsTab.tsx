import { useCcLabel, type ClientCard } from "@/entities/admin-callcenter";
import { RowCard, StatusPill } from "@/shared/ui/admin";
import { fmtDateTime } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { MoreRows } from "../MoreRows";

// Leads created by or for this client.
export function LeadsTab({ card }: { card: ClientCard }) {
  const { t, locale } = useT();
  const label = useCcLabel();
  return (
    <MoreRows
      items={card.leads}
      empty={t("admCcC.none.leads")}
      render={(l) => (
        <RowCard key={l.id} icon="user-plus" title={label("admCc.cat", l.category) || t("admCc.noName")} subtitle={[label("admCcC.src", l.source), l.region].filter(Boolean).join(" · ")} meta={fmtDateTime(l.createdAt, locale)} right={<StatusPill status={l.status} label={label("admCc.qStatus", l.status)} />} />
      )}
    />
  );
}
