import { useState, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { ApiError } from "@/shared/api";
import { GuaranteeRows, durationText, useServiceRuntime, type CheckPreview, type ClientRule, type RuntimeReview } from "@/entities/service-runtime";
import { radius, useColors } from "@/shared/theme";
import { Button, Icon, Pill, PressableScale, Reveal, Text, type IconName } from "@/shared/ui";
import { ShowMore, useShowMore } from "@/shared/ui/profile";
import { useT } from "@/shared/i18n";

function Box({ i, icon, title, bg, ink, children }: { i: number; icon: IconName; title: string; bg?: string; ink?: string; children: ReactNode }) {
  const c = useColors();
  return (
    <Reveal i={i}>
      <View style={[s.box, { backgroundColor: bg ?? c.glassFill, borderColor: c.glassLine }]}>
        <View style={s.head}><Icon name={icon} size={16} color={ink ?? c.accent} /><Text variant="small" weight="bold" style={s.flex}>{title}</Text></View>
        {children}
      </View>
    </Reveal>
  );
}

// The review comes before the delivery time is set: its time and the backend's note to the client (a plain line when the note is empty).
function Review({ i, review }: { i: number; review: RuntimeReview }) {
  const c = useColors();
  const { t, locale } = useT();
  return (
    <Box i={i} icon="clock" title={t("srt.review.title")} bg={c.tint}>
      {review.time ? <Text variant="caption" weight="semibold" tone="accent">{t("srt.review.time", { time: durationText(review.time, t, locale) })}</Text> : null}
      <Text variant="small" tone="gray">{review.clientNote || t("srt.review.note")}</Text>
    </Box>
  );
}

// "What the specialist will do": the checklist as numbered steps to read — no box to tick here (TZ §4.3) — the required ones marked as the
// web portal marks them, ten at a time.
function Steps({ i, items, reset }: { i: number; items: CheckPreview[]; reset: string }) {
  const c = useColors();
  const { t } = useT();
  const page = useShowMore(items, reset);
  return (
    <Box i={i} icon="list" title={t("srt.check.title")}>
      {page.visible.map((it, n) => (
        <View key={it.id} style={s.row}>
          <View style={[s.num, { backgroundColor: c.tint2 }]}><Text variant="caption" weight="bold" tone="accent">{n + 1}</Text></View>
          <View style={s.flex}>
            <Text variant="small" weight="semibold">{it.title}</Text>
            {it.description ? <Text variant="caption" tone="gray">{it.description}</Text> : null}
            {it.required ? <Pill label={t("srt.check.required")} tone="gray" small /> : null}
          </View>
        </View>
      ))}
      <ShowMore left={page.left} expanded={page.expanded} onMore={page.more} onLess={page.less} />
    </Box>
  );
}

// A version like "1.0" is worth a caption; an internal one ("inline-a7e3…") says nothing to the client.
const shownVersion = (v: string): string => (/^v?\d+(\.\d+)*$/i.test(v) ? v.replace(/^v/i, "") : "");

// One client rule: the title, its version and the text (already plain — the backend's HTML is turned into lines), folded when long.
function Rule({ rule, first }: { rule: ClientRule; first: boolean }) {
  const c = useColors();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const long = rule.body.length > 220 || rule.body.split("\n").length > 4;
  const v = shownVersion(rule.version);
  return (
    <View style={[s.rule, !first && [s.next, { borderTopColor: c.line }]]}>
      {rule.title ? <Text variant="small" weight="semibold">{rule.title}</Text> : null}
      {v ? <Text variant="caption" tone="gray2">{t("srt.rules.version", { v })}</Text> : null}
      {rule.body ? <Text variant="small" tone="gray" numberOfLines={long && !open ? 4 : undefined} selectable>{rule.body}</Text> : null}
      {long ? (
        <PressableScale onPress={() => setOpen((x) => !x)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={s.toggle}>
          <Text variant="small" weight="semibold" tone="accent">{t(open ? "srt.rules.less" : "srt.rules.more")}</Text>
        </PressableScale>
      ) : null}
    </View>
  );
}

function Rules({ i, items, reset }: { i: number; items: ClientRule[]; reset: string }) {
  const { t } = useT();
  const page = useShowMore(items, reset);
  return (
    <Box i={i} icon="file-text" title={t("srt.rules.title")}>
      {page.visible.map((r, n) => <Rule key={r.id || `${r.title}-${n}`} rule={r} first={n === 0} />)}
      <ShowMore left={page.left} expanded={page.expanded} onMore={page.more} onLess={page.less} />
    </Box>
  );
}

// What the runtime configuration adds to a service page for the client (TZ.md §4.3): the review that comes first, what the specialist will do,
// the client's rules (never the executor's) and the guarantees returned for this placement. It loads beside the passport and never holds
// the page up: nothing is drawn while it loads, an empty part is left out, a failure leaves one quiet line with a retry.
export function ServiceTerms({ serviceId }: { serviceId: string }) {
  const c = useColors();
  const { t } = useT();
  const q = useServiceRuntime(serviceId);
  const rt = q.data;
  if (!rt) {
    // 404: the service is not active on the marketplace, so there is nothing to add.
    if (!q.isError || (q.error instanceof ApiError && q.error.status === 404)) return null;
    return (
      <View style={[s.err, { backgroundColor: c.surface2 }]}>
        <Icon name="alert-circle" size={16} tone="gray" />
        <Text variant="small" tone="gray" style={s.flex}>{t("srt.error")}</Text>
        <Button title={t("common.retry")} size="sm" variant="line" onPress={() => void q.refetch()} />
      </View>
    );
  }
  let n = 0;
  return (
    <>
      {rt.review ? <Review i={n++} review={rt.review} /> : null}
      {rt.checklist.length ? <Steps i={n++} items={rt.checklist} reset={serviceId} /> : null}
      {rt.clientRules.length ? <Rules i={n++} items={rt.clientRules} reset={serviceId} /> : null}
      {rt.guarantees.length ? <Box i={n++} icon="shield" title={t("srt.g.title")} bg={c.okBg} ink={c.ok}><GuaranteeRows items={rt.guarantees} reset={serviceId} /></Box> : null}
    </>
  );
}

const s = StyleSheet.create({
  box: { gap: 10, padding: 14, borderRadius: 18, borderWidth: 1 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  num: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  rule: { gap: 4 },
  next: { borderTopWidth: 1, paddingTop: 10 },
  toggle: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" },
  err: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: radius.r },
  flex: { flex: 1, gap: 2 },
});
