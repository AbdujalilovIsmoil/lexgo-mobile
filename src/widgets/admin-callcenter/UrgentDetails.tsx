import { StyleSheet, View } from "react-native";
import { useCcLabel, type UrgentRequest } from "@/entities/admin-callcenter";
import { Icon, Pill, PressableScale, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { fmtDateTime } from "@/shared/lib/format";
import { openUrl } from "@/shared/lib/links";
import { useT } from "@/shared/i18n";

// What the client asked, what they attached, and — once there is one — the result or the cancel reason.
export function UrgentDetails({ req }: { req: UrgentRequest }) {
  const { t, locale } = useT();
  const label = useCcLabel();
  return (
    <>
      <SectionCard title={t("admCc.need")}>
        <Text variant="body">{req.need || t("admCc.noNeed")}</Text>
        {req.directions.length ? <View style={s.pills}>{req.directions.map((d, i) => <Pill key={`${d}-${i}`} tone="cy" label={label("admCc.dir", d)} />)}</View> : null}
        {req.serviceKind === "second_opinion_group" ? <Text variant="caption" tone="gray">{t("admCc.requestedN", { n: req.lawyerCount || 0 })}</Text> : null}
      </SectionCard>
      {req.files.length ? (
        <SectionCard title={t("admCc.attachments")}>
          {req.files.map((f, i) => (
            <PressableScale key={`${f.url}-${i}`} onPress={() => f.url && openUrl(f.url)} style={s.file}>
              <Icon name={f.voice ? "mic" : "file-text"} size={18} tone="accent" />
              <Text variant="small" weight="semibold" numberOfLines={1} style={{ flex: 1 }}>{f.name}</Text>
            </PressableScale>
          ))}
        </SectionCard>
      ) : null}
      {req.resultSummary || req.nextAction ? (
        <SectionCard title={t("admCc.result")}>
          {req.resultSummary ? <Text variant="body">{req.resultSummary}</Text> : null}
          {req.nextAction ? <Text variant="small" tone="gray">{`${t("admCc.nextAction")}: ${req.nextAction}`}</Text> : null}
          {req.completedAt ? <Text variant="caption" tone="gray2">{fmtDateTime(req.completedAt, locale)}</Text> : null}
        </SectionCard>
      ) : null}
      {req.cancelReason ? (
        <SectionCard title={t("admCc.cancelled")}>
          <Text variant="body">{req.cancelReason}</Text>
          {req.cancelledAt ? <Text variant="caption" tone="gray2">{fmtDateTime(req.cancelledAt, locale)}</Text> : null}
        </SectionCard>
      ) : null}
    </>
  );
}

const s = StyleSheet.create({ pills: { flexDirection: "row", flexWrap: "wrap", gap: 6 }, file: { flexDirection: "row", alignItems: "center", gap: 10 } });
