import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { durationText, leftText, msUntil, type FlowOrder, type FlowPhase } from "@/entities/market-flow";
import { Icon, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";
import { useServerNow } from "@/shared/network";

const THREE_HOURS = 3 * 3600_000;

type Props = { flow: FlowOrder; phase: FlowPhase; role: "client" | "seller" };

// The time the order runs on, from the backend's own timestamps: the review stage's countdown (TZ §7, §16.1 — neutral, a warning under
// three hours, then "the call center is resolving this delay", never below zero), the rework's deadline with the call center's note, the
// delivery deadline of the work with the agreed duration, or — for the client of a paid order not accepted yet — the seller's answer window
// (Enterprise contract §4, §7: past it the call center carries the order on, never "no lawyer found"). Each side sees only its own note.
export function WorkTimeCard({ flow, phase, role }: Props) {
  const { t, locale } = useT();
  const rework = phase === "rework" ? flow.complaint : null;
  const review = phase === "reviewing" ? flow.review : null;
  const due = phase === "in_progress" ? flow.expectedCompletedAt : "";
  const answer = role === "client" && (phase === "assigned" || phase === "replacing") ? flow.acceptanceDeadlineAt : "";
  const deadline = review?.deadlineAt || rework?.reworkDeadlineAt || due || answer;
  if (!review && !rework && !due && !answer) return null;
  const note = review ? (role === "seller" ? review.sellerNote : review.clientNote) : rework?.resolutionNote ?? "";
  return (
    <Countdown
      deadline={deadline}
      icon={review ? "search" : rework ? "rotate-cw" : answer ? "user-check" : "calendar"}
      title={t(review ? "mf.rv.title" : rework ? "mf.work.reworkTitle" : answer ? "mf.work.answerTitle" : "mf.work.dueTitle")}
      warnUnder={review ? THREE_HOURS : 0}
      tick={review || rework || answer ? 1000 : 30_000}
      expiredText={t(review ? "mf.rv.expired" : answer ? "mf.work.answerExpired" : "mf.work.overdue")}
      lines={[
        rework && rework.reworkIteration > 1 ? t("mf.work.reworkRound", { n: rework.reworkIteration }) : "",
        !review && !answer && deadline ? t(rework ? "mf.work.reworkDue" : "mf.work.due", { date: fmtDateTime(deadline, locale) }) : "",
        !review && !rework && !answer && flow.duration ? t("mf.work.duration", { d: durationText(flow.duration, t) }) : "",
      ]}
      note={note}
      noteTitle={t(rework ? "mf.work.reworkNote" : "mf.rv.note")}
    />
  );
}

// `tick`: a review or rework countdown redraws every second (TZ §2.2); a delivery date days away twice a minute.
type CountdownProps = { deadline: string; icon: IconName; title: string; warnUnder: number; tick: number; expiredText: string; lines: string[]; note: string; noteTitle: string };

function Countdown({ deadline, icon, title, warnUnder, tick, expiredText, lines, note, noteTitle }: CountdownProps) {
  const c = useColors();
  const { t } = useT();
  const qc = useQueryClient();
  const end = Date.parse(deadline);
  const known = Number.isFinite(end);
  const now = useServerNow(known, tick, known ? end : Infinity);
  const left = known ? msUntil(deadline, now) : Infinity;
  const expired = known && left === 0;
  // The backend moves the order on at the deadline (escalation, overdue): read it once more when the clock reaches zero.
  const refetched = useRef(false);
  useEffect(() => {
    if (!expired || refetched.current) return;
    refetched.current = true;
    void qc.invalidateQueries({ queryKey: ["market-orders"] });
    void qc.invalidateQueries({ queryKey: ["pro-order"] });
  }, [expired, qc]);
  const tone = expired ? c.err : warnUnder && left < warnUnder ? c.warn : c.accent;
  return (
    <View style={[s.box, { backgroundColor: expired ? c.errBg : tone === c.warn ? c.warnBg : c.tint2 }]}>
      <View style={s.head}>
        <Icon name={expired ? "alert-circle" : icon} size={18} color={tone} />
        <Text variant="small" weight="bold" style={[s.flex, { color: tone }]}>{title}</Text>
        {known && !expired ? <Text variant="small" weight="bold" style={{ color: tone }}>{t("mf.work.left", { time: leftText(left, t) })}</Text> : null}
      </View>
      {expired ? <Text variant="small" tone="err">{expiredText}</Text> : warnUnder && left < warnUnder ? <Text variant="caption" tone="warn">{t("mf.rv.soon")}</Text> : null}
      {lines.filter(Boolean).map((l) => <Text key={l} variant="caption" tone="gray">{l}</Text>)}
      {note ? (
        <View style={[s.quote, { borderLeftColor: tone }]}>
          <Text variant="caption" tone="gray">{noteTitle}</Text>
          <Text variant="small">{note}</Text>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  box: { borderRadius: 18, padding: 14, gap: 6 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  quote: { borderLeftWidth: 3, paddingLeft: 10, gap: 2, marginTop: 2 },
  flex: { flex: 1 },
});
