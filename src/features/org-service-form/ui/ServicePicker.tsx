import { useState } from "react";
import { View } from "react-native";
import { useServiceSearch } from "@/entities/service";
import { Icon, Input, Skeleton, Text } from "@/shared/ui";
import { RowCard } from "@/shared/ui/admin";
import { useDebounced } from "@/shared/lib/useDebounced";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import type { Picked } from "../model/useServiceForm";

type Props = { taken: Set<string>; onPick: (s: Picked) => void };

// Search the catalog (GET /services/search) for a service the member does not offer yet.
export function ServicePicker({ taken, onPick }: Props) {
  const { t } = useT();
  const [q, setQ] = useState("");
  const res = useServiceSearch(useDebounced(q, 350));
  const rows = (res.data ?? []).slice(0, 20);
  return (
    <View style={{ gap: 10 }}>
      <Text variant="caption" tone="gray">{t("ntd.sellerV2.svc.pickHint")}</Text>
      <Input value={q} onChangeText={setQ} placeholder={t("og6.searchPh")} autoCorrect={false} left={<Icon name="search" size={18} tone="gray" />} hint={q.trim().length < 2 ? t("og6.typeMore") : undefined} />
      {res.isFetching && !rows.length ? <Skeleton height={64} round={16} /> : null}
      {rows.map((s) => {
        const used = taken.has(s.id);
        return (
          <RowCard key={s.id} icon="layers" title={s.name} subtitle={[s.categoryTitle, s.price ? `${fmtMoney(s.price)} ${t("adm.currency")}` : ""].filter(Boolean).join(" · ")} right={used ? <Text variant="caption" tone="gray">{t("og6.added")}</Text> : undefined} onPress={used ? undefined : () => onPick({ id: s.id, name: s.name, category: s.categoryTitle ?? "", catalogPrice: s.price ?? 0, advocateOnly: s.advokatRequired })} />
        );
      })}
      {res.isSuccess && !rows.length ? <Text variant="small" tone="gray" center>{t("og6.noResults")}</Text> : null}
    </View>
  );
}
