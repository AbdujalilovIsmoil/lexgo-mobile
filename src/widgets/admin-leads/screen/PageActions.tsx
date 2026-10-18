import { IconButton } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { sheetFilterCount } from "@/entities/admin-leads";
import type { LeadsPage } from "./useLeadsPage";

// Header buttons: filters (dot when some are set), new lead, more menu.
export function PageActions({ p }: { p: LeadsPage }) {
  const { t } = useT();
  return (
    <>
      <IconButton icon="sliders" size={38} label={t("adm.filters")} badge={sheetFilterCount(p.filter) > 0} onPress={() => p.setSheet("filter")} />
      <IconButton icon="plus" size={38} label={t("adm.add")} onPress={() => p.setSheet("create")} />
      <IconButton icon="more-horizontal" size={38} label={t("admLeads.more")} onPress={() => p.setSheet("more")} />
    </>
  );
}
