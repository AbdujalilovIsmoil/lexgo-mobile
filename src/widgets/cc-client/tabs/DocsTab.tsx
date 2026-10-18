import { useCcLabel, type ClientCard } from "@/entities/admin-callcenter";
import { RowCard, StatusPill } from "@/shared/ui/admin";
import { fmtDateTime } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import { MoreRows } from "../MoreRows";

const isDoc = (s: string) => /document|contract/i.test(s);
type Doc = { id: string; title: string; sub: string; status: string; at: string };

// Document trail of the client: paid document requests and document actions from the activity log.
// (The backend has no per-client document list for operators; the ticket workspace shows recent documents of its client.)
export function DocsTab({ card }: { card: ClientCard }) {
  const { t, locale } = useT();
  const label = useCcLabel();
  const docs: Doc[] = [
    ...card.payments.filter((p) => isDoc(p.kind)).map((p): Doc => ({ id: `p-${p.id}`, title: label("admCcC.payKind", p.kind), sub: `${fmtMoney(p.amount)} ${t("adm.currency")}`, status: p.status, at: p.createdAt })),
    ...card.activities.filter((a) => isDoc(a.action)).map((a): Doc => ({ id: `a-${a.id}`, title: a.detail || label("admCcC.act", a.action), sub: label("admCcC.act", a.action), status: "", at: a.createdAt })),
  ].sort((a, b) => b.at.localeCompare(a.at));
  return <MoreRows items={docs} empty={t("cc2.none.docs")} render={(d) => <RowCard key={d.id} icon="file-text" title={d.title} subtitle={d.sub} meta={fmtDateTime(d.at, locale)} right={d.status ? <StatusPill status={d.status} /> : undefined} />} />;
}
