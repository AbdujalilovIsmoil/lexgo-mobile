import type { ReactNode } from "react";
import { View } from "react-native";
import { ChipBar, SearchBox } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { FLOWS } from "@/entities/doc-queue";
import type { DocFilter } from "./useDocFilter";

// Search box + "work type" chips shared by the request list and the pool.
export function DocFilters({ f, children }: { f: DocFilter; children?: ReactNode }) {
  const { t } = useT();
  const flows = ["all", ...FLOWS].map((v) => ({ value: v, label: t(`ad1.flow.${v}`) }));
  return (
    <View style={{ gap: 10, paddingBottom: 12, marginHorizontal: -16 }}>
      {children}
      <SearchBox value={f.q} onChangeText={f.setQ} placeholder={t("ad1.search")} />
      <ChipBar options={flows} value={f.flow} onChange={f.setFlow} />
    </View>
  );
}
