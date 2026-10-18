import type { OverlaidCategory } from "@/entities/admin-services";
import { Pill } from "@/shared/ui";
import { CcAction, CcTicket } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";
import type { useCategoryActions } from "./useCategoryActions";

type Props = { cat: OverlaidCategory; act: ReturnType<typeof useCategoryActions>; onEdit: () => void };

// One category as a ticket: service count, hidden / renamed / inactive chips and round restore, reset, hide and edit buttons.
export function CategoryTicket({ cat: c, act, onEdit }: Props) {
  const { t } = useT();
  return (
    <CcTicket
      tint={c.hidden ? "#94A3B8" : "#00CFE8"} icon="layers" title={c.name} subtitle={c.slug}
      badge={<Pill small tone="gray" label={t("admSvc.catServices", { n: c.servicesCount })} />}
      chips={<>
        {c.overridden ? <Pill small tone="gray" label={t("admSvc.catOverridden")} /> : null}
        {c.hidden ? <Pill small tone="warn" label={t("admSvc.catHiddenTag")} /> : null}
        {c.isActive ? null : <Pill small tone="err" label={t("adm.inactive")} />}
      </>}
      actions={<>
        {c.hidden ? <CcAction icon="eye" label={t("admSvc.catRestore")} onPress={() => act.restore(c)} /> : <CcAction icon="trash-2" label={t("adm.delete")} onPress={() => act.hide(c)} />}
        {c.overridden ? <CcAction icon="refresh-cw" label={t("admSvc.catResetAction")} onPress={() => act.reset(c)} /> : null}
        <CcAction primary icon="edit-2" label={t("adm.edit")} onPress={onEdit} />
      </>}
      onPress={onEdit}
    />
  );
}
