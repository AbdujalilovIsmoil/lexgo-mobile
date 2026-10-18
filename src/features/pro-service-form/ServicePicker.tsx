import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useServiceSearch } from "@/entities/service";
import { isAdvocateOnly } from "@/entities/pro-service";
import { useColors } from "@/shared/theme";
import { Icon, Input, ListRowSkeleton, PressableScale, Text } from "@/shared/ui";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useSom } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";
import type { PickedService } from "./types";

type Props = { onPick: (s: PickedService) => void; taken: Set<string>; yurist: boolean };

// Search the catalogue (GET /services/search) for a service to offer. Already added ones and — for a yurist —
// advocate-only ones are shown but cannot be chosen.
export function ServicePicker({ onPick, taken, yurist }: Props) {
  const { t } = useT();
  const c = useColors();
  const som = useSom();
  const [q, setQ] = useState("");
  const res = useServiceSearch(useDebounced(q, 300));
  const rows = (res.data ?? []).filter((x) => x.isActive);
  return (
    <View style={s.col}>
      <Text variant="caption" tone="gray">{t("ntd.sellerV2.svc.pickHint")}</Text>
      <Input label={t("sl7.service")} value={q} onChangeText={setQ} placeholder={t("sl7.searchPh")} autoCapitalize="none" left={<Icon name="search" size={18} tone="gray" />} hint={q.trim().length < 2 ? t("sl7.typeMore") : undefined} />
      {res.isFetching && !rows.length ? <ListRowSkeleton rows={3} /> : null}
      {q.trim().length >= 2 && !res.isFetching && !rows.length ? <Text variant="small" tone="gray">{t("sl7.noResults")}</Text> : null}
      {rows.map((x) => {
        const block = taken.has(x.id) ? "added" : yurist && isAdvocateOnly(x, x.slug) ? "advocate" : "";
        return (
          <PressableScale key={x.id} disabled={!!block} onPress={() => onPick({ id: x.id, name: x.name, category: [x.categoryTitle, x.subcategory].filter(Boolean).join(" · "), catalogPrice: x.price ?? 0, advokatRequired: x.advokatRequired, slug: x.slug })} style={[s.row, { borderColor: c.line, opacity: block ? 0.5 : 1 }]}>
            <View style={s.col}>
              <Text variant="body" weight="semibold" numberOfLines={2}>{x.name}</Text>
              <Text variant="caption" tone="gray" numberOfLines={1}>{block ? t(`sl7.block.${block}`) : [x.categoryTitle, x.price ? t("sl7.fromPrice", { sum: som(x.price) }) : ""].filter(Boolean).join(" · ")}</Text>
            </View>
            <Icon name={block ? "lock" : "plus-circle"} size={20} tone={block ? "gray" : "accent"} />
          </PressableScale>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({ col: { flex: 1, gap: 8 }, row: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1.5 } });
