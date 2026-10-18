import { diff, useHistory, type HistoryEntry, type PolicySection } from "@/entities/admin-policies";
import { FormSheet, QueryBoundary } from "@/shared/ui/admin";
import { Button, Pill, Text } from "@/shared/ui";
import type { Dict } from "@/shared/lib/json";
import { View } from "react-native";
import { fmtDateTime } from "@/shared/lib/format";
import { useKept } from "@/shared/lib/useKept";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const MAX = 12;

function Version({ h, first, onLoad }: { h: HistoryEntry; first: boolean; onLoad?: () => void }) {
  const { t, locale } = useT();
  const c = useColors();
  const changes = diff(h.previous, h.current);
  return (
    <View style={{ borderWidth: 1, borderColor: c.line, borderRadius: 16, padding: 14, gap: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text variant="body" weight="bold" style={{ flex: 1 }}>{h.version ? `v${h.version}` : t("admPol.version")} · {fmtDateTime(h.at, locale)}</Text>
        {first ? <Pill small tone="ok" label={t("admPolD.current")} /> : null}
      </View>
      {h.changedBy ? <Text variant="caption" tone="gray2">{h.changedBy.slice(0, 8)}…</Text> : null}
      {!changes.length ? <Text variant="small" tone="gray">{h.previous ? t("admPol.noChanges") : t("admPol.firstVersion")}</Text> : null}
      {changes.slice(0, MAX).map((x) => (
        <Text key={x.path} variant="small"><Text variant="small" weight="semibold">{x.path}: </Text><Text variant="small" tone="gray">{x.from ?? "∅"}</Text><Text variant="small"> → </Text><Text variant="small" tone="accent">{x.to ?? "∅"}</Text></Text>
      ))}
      {changes.length > MAX ? <Text variant="caption" tone="gray2">{t("admPol.moreChanges", { n: changes.length - MAX })}</Text> : null}
      {onLoad && h.current && !first ? <Button title={t("admPolD.load")} icon="rotate-ccw" variant="soft" size="sm" onPress={onLoad} /> : null}
    </View>
  );
}

// Version history of one policy section: when, by whom, and which fields changed from what to what.
export function PolicyHistorySheet({ section, onClose, onLoad }: { section: PolicySection | null; onClose: () => void; onLoad?: (data: Dict, version: string) => void }) {
  const { t } = useT();
  const kept = useKept(section);
  const q = useHistory(section);
  const name = kept ? (kept === "marketplace_pricing" ? t("admPolC.pr.title") : t(`admPol.sections.${kept}`)) : "";
  return (
    <FormSheet visible={!!section} onClose={onClose} title={t("admPol.historyTitle", { section: name })}>
      <QueryBoundary query={q}>
        {q.data?.length ? [...q.data].sort((a, b) => (Date.parse(b.at) || 0) - (Date.parse(a.at) || 0)).map((h, i) => <Version key={h.id} h={h} first={i === 0} onLoad={kept === "marketplace_pricing" && onLoad && h.current ? () => onLoad(h.current as Dict, h.version) : undefined} />) : <Text variant="small" tone="gray">{t("admPol.historyEmpty")}</Text>}
      </QueryBoundary>
    </FormSheet>
  );
}
