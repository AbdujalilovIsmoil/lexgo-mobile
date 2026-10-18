import { StyleSheet, View } from "react-native";
import { DOC_VALUES, EXEC_VALUES, PRICE_VALUES, SVCSORT_VALUES, execBucket, inPrice, type ExecFilter, type PriceFilter } from "@/entities/service";
import { Chip, SheetOption, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useServiceText } from "./useServiceText";
import type { Hub } from "./useServicesHub";

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={s.group}><Text variant="small" tone="gray">{title}</Text>{children}</View>;
}

// Document kind, who does the work and the price band as selectable chips with live counts; the sort as a radio list.
export function FilterGroups({ hub }: { hub: Hub }) {
  const { t } = useT();
  const x = useServiceText();
  const { f, counts } = hub;
  const execN = (v: ExecFilter) => (v === "all" ? counts.exec.length : counts.exec.filter((r) => execBucket(r) === v).length);
  const priceN = (v: PriceFilter) => counts.price.filter((r) => inPrice(r, v)).length;
  return (
    <>
      <Group title={t("csv.filterDoc")}>
        <View style={s.wrap}>{DOC_VALUES.map((v) => <Chip key={v} label={`${x.doc(v)} · ${v === "all" ? (counts.doc.template ?? 0) + (counts.doc.lawyer ?? 0) : counts.doc[v] ?? 0}`} active={f.doc === v} onPress={() => hub.set({ doc: v })} />)}</View>
      </Group>
      <Group title={t("csv.filterExec")}>
        <View style={s.wrap}>{EXEC_VALUES.map((v) => <Chip key={v} label={`${x.exec(v)} · ${execN(v)}`} active={f.exec === v} onPress={() => hub.set({ exec: v })} />)}</View>
      </Group>
      <Group title={t("csv.filterPrice")}>
        <View style={s.wrap}>{PRICE_VALUES.map((v) => <Chip key={v} label={`${x.price(v)} · ${priceN(v)}`} active={f.price === v} onPress={() => hub.set({ price: v })} />)}</View>
      </Group>
      <Group title={t("csv.sortLabel")}>
        {SVCSORT_VALUES.map((v) => <SheetOption key={v} on={f.sort === v} label={x.sort(v)} onPress={() => hub.set({ sort: v })} />)}
      </Group>
    </>
  );
}

const s = StyleSheet.create({ group: { gap: 10, marginBottom: 18 }, wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 } });
