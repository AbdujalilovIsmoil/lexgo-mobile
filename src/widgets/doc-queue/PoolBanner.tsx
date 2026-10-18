import { View } from "react-native";
import { useRouter } from "expo-router";
import { Pill, Text } from "@/shared/ui";
import { RowCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { POOL_PATH, usePool } from "@/entities/doc-queue";

// Call-center lawyers: shortcut to the open pool with the live number of waiting requests.
export function PoolBanner() {
  const { t } = useT();
  const router = useRouter();
  const pool = usePool();
  const n = pool.data?.length ?? 0;
  return (
    <View style={{ paddingBottom: 10 }}>
      <RowCard title={t("ad2.title")} subtitle={pool.isError ? t("ad2.poolFail") : t("ad2.poolHint")} icon="inbox" onPress={() => router.push(POOL_PATH)} right={n ? <Pill label={String(n)} tone="blue" /> : <Text tone="gray2">›</Text>} />
    </View>
  );
}
