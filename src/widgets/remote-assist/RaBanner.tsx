import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import type { RaSession } from "@/entities/remote-assist";
import { raControl, useRaStore, type RaControlKind } from "@/features/remote-assist";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { mmss } from "@/shared/lib/format";
import { HEADER_GAP, HEADER_ROW, useInsets } from "@/shared/lib/insets";
import { brand, radius, shadows } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { modeText } from "./names";
import { useCountdown } from "./useCountdown";

const BG = brand.b900;
const SUB = "#B7CDEC";

/** Buttons follow the session's capabilities (§14); a partial event without them leaves the client's own rights: pause or resume, revoke, end. */
function rights(s: RaSession) {
  const live = s.phase === "active";
  return s.caps ? { pause: live && s.caps.pause, resume: !live && s.caps.resume, revoke: s.caps.revoke, end: s.caps.end } : { pause: live, resume: !live, revoke: true, end: true };
}

function Round({ icon, label, onPress, busy, danger }: { icon: IconName; label: string; onPress: () => void; busy: boolean; danger?: boolean }) {
  return (
    <PressableScale onPress={onPress} disabled={busy} hitSlop={4} accessibilityRole="button" accessibilityLabel={label} style={[st.round, { backgroundColor: danger ? "rgba(255,148,148,0.2)" : "rgba(255,255,255,0.14)" }]}>
      {busy ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Icon name={icon} size={18} color={danger ? "#FFB4B4" : "#FFFFFF"} />}
    </PressableScale>
  );
}

function Wide({ icon, label, onPress, busy, danger }: { icon: IconName; label: string; onPress: () => void; busy: boolean; danger?: boolean }) {
  return (
    <PressableScale onPress={onPress} disabled={busy} accessibilityRole="button" style={[st.wide, { backgroundColor: danger ? "rgba(255,148,148,0.16)" : "rgba(255,255,255,0.1)" }]}>
      {busy ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Icon name={icon} size={17} color={danger ? "#FFB4B4" : "#FFFFFF"} />}
      <Text variant="small" weight="semibold" style={{ color: danger ? "#FFB4B4" : "#FFFFFF" }}>{label}</Text>
    </PressableScale>
  );
}

/**
 * The always-visible active-assistance banner (TZ RA §3, §17): who helps, the mode, the time left, and the client's pause / resume and
 * stop-access buttons. It sits in the top-most overlay host, so it stays above sheets, the call screen and route transitions. A tap on
 * the text opens the details and the End button.
 */
export function RaBanner() {
  const s = useRaStore((x) => x.session);
  return s ? <Banner s={s} /> : null;
}

function Banner({ s }: { s: RaSession }) {
  const { t } = useT();
  const insets = useInsets();
  const busy = useRaStore((x) => x.busy);
  const [open, setOpen] = useState(false);
  const left = useCountdown(s.expiresAt);
  const live = s.phase === "active";
  const can = rights(s);
  const name = s.operator.name || t("ra.operator");
  const mode = modeText(t, s.mode);
  const act = (k: RaControlKind) => () => void raControl(k);
  const sub = [mode.title, Number.isFinite(left) ? t("ra.left", { time: mmss(left) }) : ""].filter(Boolean).join(" · ");
  return (
    <Animated.View entering={FadeInUp.duration(220)} exiting={FadeOutUp.duration(160)} pointerEvents="box-none" style={[st.wrap, { top: insets.top + HEADER_GAP + HEADER_ROW + 6 }]}>
      <View style={[st.card, shadows.s2]} accessibilityLabel={t("ra.panel")}>
        <View style={st.row}>
          <PressableScale onPress={() => setOpen((v) => !v)} haptic={false} style={st.who} accessibilityRole="button" accessibilityLabel={`${live ? t("ra.live", { name }) : t("ra.paused")}. ${sub}`} accessibilityState={{ expanded: open }}>
            <View style={[st.dot, { backgroundColor: live ? "#3DDC97" : "#FBC15E" }]} />
            <View style={st.fill}>
              <Text variant="small" weight="bold" tone="white" numberOfLines={1}>{live ? t("ra.live", { name }) : t("ra.paused")}</Text>
              <Text variant="caption" style={{ color: SUB }} numberOfLines={1}>{sub}</Text>
            </View>
            <Icon name={open ? "chevron-up" : "chevron-down"} size={18} color={SUB} />
          </PressableScale>
          {can.pause ? <Round icon="pause" label={t("ra.pause")} onPress={act("pause")} busy={busy === "pause"} /> : null}
          {can.resume ? <Round icon="play" label={t("ra.resume")} onPress={act("resume")} busy={busy === "resume"} /> : null}
          {can.revoke ? <Round icon="x" label={t("ra.stop")} onPress={act("revoke")} busy={busy === "revoke"} danger /> : null}
        </View>
        {open ? (
          <View style={st.more}>
            <Text variant="caption" style={{ color: SUB }}>{s.operator.lexgoId ? `${t("ra.fromSupport")} · ${t("ra.lexgoId", { id: s.operator.lexgoId })}` : t("ra.fromSupport")}</Text>
            <Text variant="caption" tone="white">{mode.text}</Text>
            <Text variant="caption" style={{ color: SUB }}>{t("ra.canStop")}</Text>
            {can.pause ? <Wide icon="pause" label={t("ra.pause")} onPress={act("pause")} busy={busy === "pause"} /> : null}
            {can.resume ? <Wide icon="play" label={t("ra.resume")} onPress={act("resume")} busy={busy === "resume"} /> : null}
            {can.revoke ? <Wide icon="x-circle" label={t("ra.stop")} onPress={act("revoke")} busy={busy === "revoke"} danger /> : null}
            {can.end ? <Wide icon="power" label={t("ra.end")} onPress={act("end")} busy={busy === "end"} /> : null}
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  wrap: { position: "absolute", left: 12, right: 12, alignItems: "center" },
  card: { width: "100%", maxWidth: 560, borderRadius: radius.rl, backgroundColor: BG, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)", padding: 8, gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  who: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, minHeight: 44, paddingLeft: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  fill: { flex: 1, gap: 1 },
  round: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  more: { gap: 8, paddingHorizontal: 6, paddingBottom: 4 },
  wide: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 44, borderRadius: radius.r, paddingHorizontal: 14 },
});
