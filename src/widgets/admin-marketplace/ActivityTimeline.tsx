import { View } from "react-native";
import { Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useMktLabels, type MktActivity } from "@/entities/admin-marketplace";
import { fmtDateTime, humanizeSlug } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// Audit log of the order, newest first; failed outcomes are marked red.
export function ActivityTimeline({ rows }: { rows: MktActivity[] }) {
  const { t, locale } = useT();
  const c = useColors();
  const label = useMktLabels();
  return (
    <SectionCard title={t("admMktC.activity")}>
      {rows.length ? rows.map((a) => {
        const bad = !!a.outcome && a.outcome !== "success";
        const title = t(`admMktB.actions.${a.action}`) !== `admMktB.actions.${a.action}` ? label.action(a.action) : a.title || humanizeSlug(a.action);
        return (
          <View key={a.id || `${a.action}-${a.createdAt}`} style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ width: 9, height: 9, borderRadius: 5, marginTop: 5, backgroundColor: bad ? c.err : c.ok }} />
            <View style={{ flex: 1 }}>
              <Text variant="small" weight="bold">{title}</Text>
              {a.detail ? <Text variant="caption" tone="gray">{a.detail}</Text> : null}
              <Text variant="caption" tone="gray2">{[fmtDateTime(a.createdAt, locale), a.ip ? `IP ${a.ip}` : "", bad ? humanizeSlug(a.outcome) : ""].filter(Boolean).join(" · ")}</Text>
            </View>
          </View>
        );
      }) : <Text variant="small" tone="gray">{t("admMktC.noActivity")}</Text>}
    </SectionCard>
  );
}
