import { Pill } from "@/shared/ui";
import { CcAction, CcTicket } from "@/shared/ui/cc";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import type { AdminService } from "../model/types";

type Props = { item: AdminService; onEdit: () => void; onDelete: () => void; onReactivate: () => void };

// One service as a ticket: colour strip (blue = active), price badge, status / catalogue chips and round edit / delete / reactivate buttons.
export function ServiceRow({ item: s, onEdit, onDelete, onReactivate }: Props) {
  const { t } = useT();
  return (
    <CcTicket
      tint={s.isActive ? "#3B82F6" : "#94A3B8"} icon="briefcase" title={s.name || s.title}
      subtitle={[s.categoryTitle, s.catalogCode || s.slug].filter(Boolean).join(" · ")}
      badge={<Pill small tone="gray" label={s.price ? `${fmtMoney(s.price)} ${t("adm.currency")}` : "—"} />}
      chips={<><Pill small tone={s.isActive ? "ok" : "gray"} label={t(s.isActive ? "adm.active" : "adm.inactive")} /><Pill small tone={s.hasMetadata ? "blue" : "gray"} label={t(s.hasMetadata ? "admSvc.tagCatalog" : "admSvc.tagCustom")} /></>}
      actions={<>
        {s.isActive ? <CcAction icon="trash-2" label={t("adm.delete")} onPress={onDelete} /> : <CcAction icon="refresh-cw" label={t("admSvc.reactivate")} onPress={onReactivate} />}
        <CcAction primary icon="edit-2" label={t("adm.edit")} onPress={onEdit} />
      </>}
      onPress={onEdit}
    />
  );
}
