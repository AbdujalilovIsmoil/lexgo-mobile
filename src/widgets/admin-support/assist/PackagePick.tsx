import { View } from "react-native";
import { PickRow } from "@/entities/admin-support";
import { Button, Segmented, Skeleton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useSum } from "./useSum";
import type { useMarketFlow } from "./useMarketFlow";

const TIERS = ["BASIC", "STANDARD", "PREMIUM"];

// Package for the client: the tier first (BASIC / STANDARD / PREMIUM), then the package of that tier.
export function PackagePick({ f }: { f: ReturnType<typeof useMarketFlow> }) {
  const { t } = useT();
  const sum = useSum();
  const pk = f.packages;
  const swap = (tier: string) => { f.setTier(tier); f.pickPkg(null); };
  return (
    <View style={{ gap: 8 }}>
      <Segmented options={TIERS.map((x) => ({ value: x, label: t(`mk8.tiers.${x}`) }))} value={f.tier} onChange={swap} />
      {pk.isLoading ? <Skeleton height={52} round={14} /> : null}
      {pk.isError ? <Button title={t("common.retry")} variant="soft" size="sm" onPress={() => void pk.refetch()} /> : null}
      {f.tierPackages.map((p) => <PickRow key={p.id} title={p.title} hint={[p.categoryTitle, p.duration].filter(Boolean).join(" · ")} right={sum(p.price)} selected={f.pkg?.id === p.id} onPress={() => f.pickPkg(p)} />)}
      {pk.isSuccess && !f.tierPackages.length ? <Text variant="small" tone="gray">{t("ntd.ccV2.market.noPackages")}</Text> : null}
    </View>
  );
}
