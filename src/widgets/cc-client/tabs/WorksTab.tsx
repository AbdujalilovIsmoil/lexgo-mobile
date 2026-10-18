import type { ClientCard } from "@/entities/admin-callcenter";
import { RowCard, StatusPill } from "@/shared/ui/admin";
import { fmtDate } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { MoreRows } from "../MoreRows";

type Work = { id: string; icon: "shopping-bag" | "folder"; title: string; sub: string; meta: string; status: string };

// The client's orders and cases (TZ "Mening ishlarim" from the operator's side).
export function WorksTab({ card }: { card: ClientCard }) {
  const { t, locale } = useT();
  const works: Work[] = [
    ...card.orders.map((o): Work => ({ id: `o-${o.id}`, icon: "shopping-bag", title: o.title || o.workId || "—", sub: [o.lawyerName, fmtDate(o.createdAt, locale)].filter(Boolean).join(" · "), meta: o.workId, status: o.status })),
    ...card.cases.map((c): Work => ({ id: `c-${c.id}`, icon: "folder", title: c.title || c.workId || "—", sub: [c.stage, fmtDate(c.createdAt, locale)].filter(Boolean).join(" · "), meta: c.workId, status: c.status })),
  ];
  return <MoreRows items={works} empty={t("cc2.none.works")} render={(w) => <RowCard key={w.id} icon={w.icon} title={w.title} subtitle={w.sub} meta={w.meta} right={<StatusPill status={w.status} />} />} />;
}
