import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { PassportFacts, useServicePassport } from "@/entities/service";
import { useColors } from "@/shared/theme";
import { Button, Icon, PressableScale, Skeleton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

function Body({ id }: { id: string }) {
  const { t } = useT();
  const q = useServicePassport(id);
  if (q.data) return <PassportFacts service={q.data.service} passport={q.data.passport} />;
  if (q.isError) return <View style={s.col}><Text variant="small" tone="gray">{t("csv.pp.loadError")}</Text><Button title={t("common.retry")} size="sm" variant="soft" onPress={() => void q.refetch()} /></View>;
  return <View style={s.col}><Skeleton height={44} round={14} /><Skeleton height={44} round={14} /></View>;
}

// Collapsible service passport, fetched the first time it is opened.
export function PassportToggle({ serviceId }: { serviceId: string }) {
  const { t } = useT();
  const c = useColors();
  const [open, setOpen] = useState(false);
  return (
    <View style={s.col}>
      <PressableScale onPress={() => setOpen((v) => !v)} style={[s.head, { borderColor: c.line, backgroundColor: c.surface }]}>
        <Text variant="small" weight="bold" style={s.flex}>{t("csv.pp.title")}</Text>
        <Icon name={open ? "chevron-up" : "chevron-down"} size={18} tone="gray" />
      </PressableScale>
      {open ? <Body id={serviceId} /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  head: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 16, borderWidth: 1.5 },
  flex: { flex: 1 },
});
