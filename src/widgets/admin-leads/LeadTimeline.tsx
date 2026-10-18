import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { ErrorView, Skeleton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";
import { columnTitle, timelineLabel, useTimeline, type Column } from "@/entities/admin-leads";

// Everything that happened to the lead, newest first.
export function LeadTimeline({ leadId, cols }: { leadId: string; cols: Column[] }) {
  const { t, locale } = useT();
  const c = useColors();
  const q = useTimeline(leadId);
  const titleOf = (key: string) => {
    const col = cols.find((x) => x.key === key);
    return col ? columnTitle(t, col) : key;
  };
  if (q.isLoading) return <Skeleton height={56} round={12} />;
  if (q.isError) return <ErrorView error={q.error} onRetry={() => void q.refetch()} compact />;
  if (!q.data?.length) return <Text variant="small" tone="gray2">{t("admLeads.noTimeline")}</Text>;
  return (
    <View style={{ gap: 12 }}>
      {q.data.slice(0, 30).map((it) => (
        <View key={it.id} style={s.row}>
          <View style={[s.dot, { backgroundColor: c.accent }]} />
          <View style={s.col}>
            <Text variant="small" weight="semibold">{timelineLabel(t, it, titleOf)}</Text>
            {it.detail ? <Text variant="caption" tone="gray">{it.detail}</Text> : null}
            <Text variant="caption" tone="gray2">{fmtDateTime(it.createdAt, locale)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", gap: 10 }, dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 }, col: { flex: 1, gap: 1 } });
