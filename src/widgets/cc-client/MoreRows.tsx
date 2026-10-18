import { useState, type ReactNode } from "react";
import { View } from "react-native";
import { Button, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const STEP = 12;

// A stack of rows with "show more" (the 360 payload is already in memory, so paging is local).
export function MoreRows<T>({ items, empty, render }: { items: T[]; empty: string; render: (item: T) => ReactNode }) {
  const { t } = useT();
  const [shown, setShown] = useState(STEP);
  if (!items.length) return <Text variant="small" tone="gray" center>{empty}</Text>;
  return (
    <View style={{ gap: 10 }}>
      {items.slice(0, shown).map(render)}
      {items.length > shown ? <Button title={t("adm.loadMore")} variant="soft" size="sm" onPress={() => setShown(shown + STEP)} /> : null}
    </View>
  );
}
