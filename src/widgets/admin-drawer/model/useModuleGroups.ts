import { useMemo } from "react";
import { GROUP_ORDER, MODULES, moduleShown, useAccess, useDemoTools, type AdminModule, type GroupKey } from "@/entities/access";
import { useT } from "@/shared/i18n";

export type ModuleGroup = { key: GroupKey; mods: AdminModule[] };

// The modules this user may open (same rules as the web nav), grouped and filtered by a search text.
export function useModuleGroups(query = ""): ModuleGroup[] {
  const { t } = useT();
  const a = useAccess();
  const demo = useDemoTools();
  return useMemo(() => {
    const needle = query.trim().toLowerCase();
    const text = (m: AdminModule) => `${t(`admHub.mod.${m.key}.title`)} ${t(`admHub.mod.${m.key}.desc`)}`.toLowerCase();
    return GROUP_ORDER.map((key) => ({ key, mods: MODULES.filter((m) => m.group === key && moduleShown(m, a) && (!m.demoOnly || demo) && (!needle || text(m).includes(needle))) })).filter((g) => g.mods.length);
  }, [a, demo, query, t]);
}
