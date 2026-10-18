import { Pill } from "@/shared/ui";
import { CcAction, CcTicket } from "@/shared/ui/cc";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import { adColor, adLabel, adTone } from "../lib/status";
import type { Ad } from "../model/types";

type Props = { item: Ad; onEdit: () => void; onDelete: () => void };

// One ad product as a ticket: status colour strip, title, price badge, status/type chips, round edit/delete buttons.
export function AdRow({ item: a, onEdit, onDelete }: Props) {
  const { t } = useT();
  const gone = a.status === "deleted";
  return (
    <CcTicket
      tint={adColor(a.status)} icon="radio" title={a.title || a.workId || "—"} subtitle={a.description || undefined} onPress={onEdit}
      badge={<Pill small tone="gray" label={a.price ? `${fmtMoney(a.price)} ${t("adm.currency")}` : "—"} />}
      chips={<>
        {a.status ? <Pill small tone={adTone(a.status)} label={adLabel(t, "status", a.status)} /> : null}
        {a.recordType ? <Pill small tone="gray" label={adLabel(t, "types", a.recordType)} /> : null}
      </>}
      actions={<>
        <CcAction icon="edit-2" label={t("adm.edit")} onPress={onEdit} />
        {gone ? null : <CcAction icon="trash-2" label={t("adm.delete")} onPress={onDelete} />}
      </>}
    />
  );
}
