import { View } from "react-native";
import { useAuditFilters } from "@/features/admin-audit";
import { DateRangeBar } from "@/shared/ui/admin";
import { CcFilterBox } from "@/shared/ui/cc";
import { Chip } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Filters = ReturnType<typeof useAuditFilters>;

// Period chips and the "Filters" sheet button (user / action / target) folded behind one summary row.
export function AuditFilterBar({ f, onOpen }: { f: Filters; onOpen: () => void }) {
  const { t } = useT();
  return (
    <CcFilterBox active={f.active} summary={f.active ? `${t("adm.filters")} · ${f.active}` : t("admAuditB.period")}>
      <DateRangeBar bar={f.bar} withAll />
      <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16 }}>
        <Chip icon="sliders" label={f.active ? `${t("adm.filters")} · ${f.active}` : t("adm.filters")} active={f.active > 0} onPress={onOpen} />
        {f.active ? <Chip icon="x" label={t("adm.reset")} onPress={f.clear} /> : null}
      </View>
    </CcFilterBox>
  );
}
