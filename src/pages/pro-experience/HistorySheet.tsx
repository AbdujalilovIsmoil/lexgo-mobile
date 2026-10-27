import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { checkLabel, timelineOf, useExpHistory, type ExpCheck, type ExpEvent, type ExpGroup } from "@/entities/pro-experience";
import { BottomSheet, EmptyState, Icon, SheetScroll, Text, type IconName } from "@/shared/ui";
import { QueryBoundary } from "@/shared/ui/admin";
import { ShowMore, TimelineItem, useShowMore } from "@/shared/ui/profile";
import { useColors } from "@/shared/theme";
import { fmtDate } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { StatePill } from "./StatePill";

type Props = { group: ExpGroup | null; visible: boolean; onClose: () => void };

// GET …/experience/{id}/history (Gaps Closed §3.8) of one entry, newest first and ten at a time: each revision when it was sent (what it
// changed, where it stands now) and each decision of the call center with its reason and the checklist items worth reading.
export function HistorySheet({ group, visible, onClose }: Props) {
  const { t } = useT();
  const id = group?.latest?.id ?? group?.current?.id ?? group?.rootId ?? "";
  const q = useExpHistory(id, visible);
  const events = useMemo(() => (q.data ? timelineOf(q.data) : []), [q.data]);
  const page = useShowMore(events, id);
  const r = group?.current ?? group?.latest;
  const versions = q.data?.revisions.length || group?.revisionCount || 0;
  const subtitle = [r?.position, r?.workplace, versions > 1 ? t("pxp.hist.versions", { n: versions }) : ""].filter(Boolean).join(" · ");
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("pxp.hist.title")} subtitle={subtitle || undefined} snaps={[0.6, 0.92]}>
      <SheetScroll>
        <QueryBoundary query={q}>
          {events.length ? (
            <View>
              {page.visible.map((e, i) => <EventRow key={e.key} e={e} last={i === page.visible.length - 1} />)}
              <ShowMore left={page.left} expanded={page.expanded} onMore={page.more} onLess={page.less} />
            </View>
          ) : (
            <EmptyState compact icon="clock" title={t("pxp.hist.empty")} />
          )}
        </QueryBoundary>
      </SheetScroll>
    </BottomSheet>
  );
}

function EventRow({ e, last }: { e: ExpEvent; last: boolean }) {
  const { t, locale } = useT();
  const c = useColors();
  const time = e.at ? fmtDate(e.at, locale) : undefined;
  if (e.kind === "sent") {
    const r = e.record;
    return (
      <TimelineItem color={c.accent} title={r.version != null ? t("pxp.hist.sentV", { n: r.version }) : t("pxp.hist.sent")} subtitle={[r.position, r.workplace].filter(Boolean).join(" · ")} time={time} last={last}>
        {e.changed.length ? <Text variant="caption" tone="gray2">{t("pxp.note.changed", { list: e.changed.map((k) => t(`pxp.field.${k}`)).join(", ") })}</Text> : null}
        <View style={s.pill}><StatePill state={r.status} years={r.years} /></View>
      </TimelineItem>
    );
  }
  const { decision, reason, checklist } = e.review;
  const head = decision === "approved" ? t("pxp.hist.approved") : decision === "rejected" ? t("pxp.hist.rejected") : t("pxp.hist.reviewed");
  return (
    <TimelineItem color={decision === "approved" ? c.ok : decision === "rejected" ? c.err : c.gray} title={[head, e.version != null ? t("pxp.note.version", { n: e.version }) : ""].filter(Boolean).join(" · ")} time={time} last={last}>
      {reason ? <Text variant="caption" tone={decision === "rejected" ? "err" : "gray"}>{decision === "rejected" ? t("mf.exp.reason", { text: reason }) : t("pxp.hist.note", { text: reason })}</Text> : null}
      <Checks list={checklist} />
    </TimelineItem>
  );
}

const VERDICT: Record<string, [IconName, "ok" | "gray" | "err"]> = { approved: ["check", "ok"], not_applicable: ["minus", "gray"] };

// How many items passed, then only the ones worth reading: not passed, or with the reviewer's note.
function Checks({ list }: { list: ExpCheck[] }) {
  const { t } = useT();
  const c = useColors();
  if (!list.length) return null;
  const passed = list.filter((x) => x.verdict === "approved").length;
  return (
    <View style={s.checks}>
      <Text variant="caption" tone="gray">{t("pxp.hist.checks", { ok: passed, n: list.length })}</Text>
      {list.filter((x) => x.verdict !== "approved" || x.note).map((x) => {
        const [icon, tone] = VERDICT[x.verdict] ?? ["x", "err"];
        const verdict = t(`pxp.verdict.${x.verdict}`) !== `pxp.verdict.${x.verdict}` ? t(`pxp.verdict.${x.verdict}`) : x.verdict;
        return (
          <View key={x.key} style={s.check} accessible accessibilityLabel={`${checkLabel(x.key, t)}: ${verdict}${x.note ? `. ${x.note}` : ""}`}>
            <Icon name={icon} size={14} color={tone === "ok" ? c.ok : tone === "err" ? c.err : c.gray} />
            <Text variant="caption" style={s.flex}>{x.note ? `${checkLabel(x.key, t)} — ${x.note}` : checkLabel(x.key, t)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  pill: { marginTop: 4 },
  checks: { gap: 4, marginTop: 4 },
  check: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  flex: { flex: 1 },
});
