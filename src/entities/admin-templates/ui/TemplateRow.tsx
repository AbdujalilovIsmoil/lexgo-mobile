import { Pill } from "@/shared/ui";
import { CcAction, CcTicket } from "@/shared/ui/cc";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import type { Template } from "../model/types";

type Props = { item: Template; onEdit: () => void; onDelete: () => void; onToggle: () => void };

// One template as a ticket: colour strip (blue = live, grey = draft), title, price badge, state / fields chips and round
// buttons — publish or hide (primary for drafts), edit, delete.
export function TemplateRow({ item: d, onEdit, onDelete, onToggle }: Props) {
  const { t } = useT();
  return (
    <CcTicket
      tint={d.isActive ? "#3B82F6" : "#94A3B8"} icon="file-text" title={d.name || d.slug} onPress={onEdit}
      subtitle={[d.category, d.language, d.slug].filter(Boolean).join(" · ") || undefined}
      badge={d.price ? <Pill small tone="gray" label={`${fmtMoney(d.price)} ${t("adm.currency")}`} /> : undefined}
      chips={<>
        <Pill small tone={d.isActive ? "ok" : "warn"} label={t(d.isActive ? "admTplC.live" : "admTplC.draft")} />
        {d.fieldsCount ? <Pill small tone="gray" label={t("admTplC.fields", { n: d.fieldsCount })} /> : null}
      </>}
      actions={<>
        <CcAction icon="trash-2" label={t("adm.delete")} onPress={onDelete} />
        <CcAction icon="edit-2" label={t("adm.edit")} onPress={onEdit} />
        <CcAction primary={!d.isActive} icon={d.isActive ? "eye-off" : "check-circle"} label={t(d.isActive ? "admTplC.hide" : "admTplC.publish")} onPress={onToggle} />
      </>}
    />
  );
}
