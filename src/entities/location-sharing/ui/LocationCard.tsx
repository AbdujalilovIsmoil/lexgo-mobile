import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useT } from "@/shared/i18n";
import { radius, useColors } from "@/shared/theme";
import { Card, Icon, PressableScale, Text, Toggle } from "@/shared/ui";
import { fmtSpan } from "../lib/duration";
import { shownAccuracy } from "../lib/sharing";
import { useLocationSharing } from "../model/useLocationSharing";
import { useLocationSheet } from "../model/useLocationSheet";
import { LocationSheet } from "./LocationSheet";

type Props = { onStart?: () => void };

// Location sharing as one switch row: pin, title with a one-line state, and the switch. Switching it on opens the 3-step sheet
// (permission, duration) and it only turns on once sharing really started; switching it off stops at once. While sharing, a thin
// bar shows how much of the chosen time is left. Opens its own sheet unless onStart is given.
export function LocationCard({ onStart }: Props) {
  const { t } = useT();
  const c = useColors();
  const { state, on, busy, errorText, stop } = useLocationSharing();
  const sheet = useLocationSheet();
  const now = useNow(on);
  const unknown = state.mode === "unknown";
  const timed = on && !state.manual && state.until !== null;
  const left = timed ? Math.max(0, state.until! - now) : 0;
  const started = state.lastSentAt ?? state.until; // without the start time the bar is not drawn
  const total = timed && state.lastSentAt !== null ? state.until! - state.lastSentAt : 0;

  const status = on
    ? timed
      ? t("svcRules.locTextOn", { time: fmtSpan(Math.max(60, left / 1000), t) })
      : t("svcRules.locTextOnManual")
    : t(unknown ? "svcRules.locTextUnknown" : "svcRules.locTextOff");
  const acc = shownAccuracy(state.lastAccuracy);
  const ago = on && state.lastSentAt !== null ? Math.max(0, now - state.lastSentAt) : null;
  const last = ago === null || acc === null ? "" : ago < 60_000 ? t("svcRules.locLastSentNow", { m: acc }) : t("svcRules.locLastSent", { time: fmtSpan(ago / 1000, t), m: acc });
  const share = total > 0 && started !== null ? Math.min(1, Math.max(0, left / total)) : null;
  const change = (v: boolean) => {
    if (v) (onStart ?? sheet.open)();
    else void stop();
  };

  return (
    <Card style={s.card}>
      <View style={s.row}>
        <View style={[s.ic, { backgroundColor: on ? c.okBg : c.tint2 }]}>
          <Icon name="map-pin" size={20} color={on ? c.ok : c.accent} />
        </View>
        <View style={s.body}>
          <Text variant="body" weight="bold" numberOfLines={1}>{t("svcRules.locTitle")}</Text>
          <Text variant="caption" tone={on ? "ok" : "gray"} numberOfLines={on ? 1 : 2} accessibilityLiveRegion="polite">{status}</Text>
        </View>
        <Toggle value={on} onChange={change} disabled={busy} label={t("svcRules.locTitle")} />
      </View>
      {share !== null ? (
        <View accessible accessibilityRole="progressbar" accessibilityLabel={status} style={[s.track, { backgroundColor: c.surface2 }]}>
          <View style={[s.fill, { width: `${Math.round(share * 100)}%`, backgroundColor: c.ok }]} />
        </View>
      ) : null}
      {last ? <Text variant="caption" tone="gray" numberOfLines={1}>{last}</Text> : null}
      {unknown ? (
        <PressableScale onPress={() => void stop()} disabled={busy} accessibilityRole="button" style={s.link}>
          <Text variant="caption" weight="bold" tone="accent">{t("svcRules.locStopUnknown")}</Text>
        </PressableScale>
      ) : null}
      {errorText ? (
        <View style={[s.err, { backgroundColor: c.errBg }]} accessibilityRole="alert" accessibilityLiveRegion="polite">
          <Text variant="small" tone="err">{errorText}</Text>
        </View>
      ) : null}
      {onStart ? null : <LocationSheet visible={sheet.visible} onClose={sheet.close} />}
    </Card>
  );
}

// Clock (30 s) while sharing is on (the countdown, the bar and "x ago").
function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0); // catch up at once when sharing has just been switched on
    const id = setInterval(tick, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [active]);
  return now;
}

const s = StyleSheet.create({
  card: { gap: 10, paddingVertical: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  ic: { width: 40, height: 40, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, gap: 2 },
  track: { height: 6, borderRadius: 3, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3 },
  link: { alignSelf: "flex-start", minHeight: 36, justifyContent: "center" },
  err: { borderRadius: radius.r, padding: 12 },
});
