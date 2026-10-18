import { useState } from "react";
import { View } from "react-native";
import { Button, Text } from "@/shared/ui";
import { RowCard } from "@/shared/ui/admin";
import type { CeoCtx } from "./lib/useCeoCtx";

const PAGE = 6;

// Per-channel numbers (the web's table): source, leads, payments, revenue and conversion.
export function CeoChannelList({ x }: { x: CeoCtx }) {
  const { t, fmt, label } = x;
  const [all, setAll] = useState(false);
  const rows = x.c?.channels ?? [];
  if (!rows.length) return null;
  return (
    <View style={{ gap: 10 }}>
      <Text variant="h4">{t("admCeo.channelTable.title")}</Text>
      {(all ? rows : rows.slice(0, PAGE)).map((ch, i) => (
        <RowCard
          key={`${ch.name}-${i}`} icon="share-2" title={label.source(ch.name)}
          subtitle={`${t("admCeo.channelTable.leads")}: ${ch.leads} · ${t("admCeo.channelTable.payments")}: ${ch.payments} · ${t("admCeo.channelTable.conversion")}: ${ch.pct}%`}
          right={<Text variant="small" weight="bold">{fmt.short(ch.revenue)}</Text>}
        />
      ))}
      {rows.length > PAGE && !all ? <Button title={t("adm.loadMore")} variant="soft" full onPress={() => setAll(true)} /> : null}
    </View>
  );
}
