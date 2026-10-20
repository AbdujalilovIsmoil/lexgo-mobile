import { useState } from "react";
import { StyleSheet, View } from "react-native";
import type { MktFilters } from "@/features/admin-marketplace";
import { Chip, IconButton } from "@/shared/ui";
import { fmtDate } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { MktFilterSheet } from "./MktFilterSheet";

// One filter button; what is applied (status, seller, client, period) shows as chips that can be removed one by one, and the
// sheet behind the button holds every field. The sellers tab only has the period.
export function MktFilterBar({ f, withParties }: { f: MktFilters; withParties: boolean }) {
  const { t, locale } = useT();
  const [open, setOpen] = useState(false);
  const day = (k: string) => fmtDate(`${k}T12:00:00`, locale);
  const preset = f.bar.preset;
  const period = preset === "all" ? "" : preset === "custom" ? [f.bar.from && day(f.bar.from), f.bar.to && day(f.bar.to)].filter(Boolean).join(" – ") || t("adm.custom") : t(`adm.${preset}`);
  const on = !!period || (withParties && !!(f.status || f.seller || f.client));
  return (
    <View style={s.row}>
      <View style={s.chips}>
        {withParties && f.status ? <Chip label={t(`admMkt.filter.statusOpt.${f.status}`)} active icon="x" onPress={() => f.setStatus("")} /> : null}
        {withParties && f.seller ? <Chip label={f.seller.label} active icon="x" onPress={() => f.setSeller(null)} /> : null}
        {withParties && f.client ? <Chip label={f.client.label} active icon="x" onPress={() => f.setClient(null)} /> : null}
        {period ? <Chip label={period} active icon="x" onPress={() => f.bar.setPreset("all")} /> : null}
      </View>
      <IconButton icon="sliders" label={t("adm.filters")} badge={on} onPress={() => setOpen(true)} />
      <MktFilterSheet f={f} visible={open} onClose={() => setOpen(false)} withParties={withParties} />
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  chips: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
