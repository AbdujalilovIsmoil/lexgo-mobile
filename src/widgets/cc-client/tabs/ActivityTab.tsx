import { useCcLabel, type ClientCard } from "@/entities/admin-callcenter";
import { RowCard } from "@/shared/ui/admin";
import { fmtDateTime } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { MoreRows } from "../MoreRows";

// The client's latest actions in the app (login, orders, payments, complaints …).
export function ActivityTab({ card }: { card: ClientCard }) {
  const { t, locale } = useT();
  const label = useCcLabel();
  return <MoreRows items={card.activities} empty={t("admCcC.none.activity")} render={(a) => <RowCard key={a.id} icon="activity" title={label("admCcC.act", a.action)} subtitle={a.detail} meta={fmtDateTime(a.createdAt, locale)} />} />;
}
