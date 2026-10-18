import { useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { useT } from "@/shared/i18n";
import { radius, useColors } from "@/shared/theme";
import { BottomSheet, Button, Icon, PressableScale, SheetScroll, Text, toast } from "@/shared/ui";
import { selectHaptic } from "@/shared/lib/haptics";
import { clockTime } from "../lib/duration";
import { LOCATION_DURATIONS, shownAccuracy } from "../lib/sharing";
import { LocationFailure, askPermission, readPermission, readPosition } from "../model/position";
import { useLocationSharing } from "../model/useLocationSharing";
import type { Fix, LocErrorKind } from "../model/types";

type Props = { visible: boolean; onClose: () => void; onStarted?: () => void };
type Duration = number | null;

const ERR: Record<LocErrorKind, string> = { denied: "svcRules.locErrDenied", unavailable: "svcRules.locErrUnavailable", timeout: "svcRules.locErrTimeout", server: "svcRules.locErrServer", build: "svcRules.locErrBuild" };

// "Joylashuvni ulashish": 3-step dialog (intro, permission + fix, duration) as a bottom sheet.
export function LocationSheet({ visible, onClose, onStarted }: Props) {
  const [was, setWas] = useState(false);
  const [session, setSession] = useState(0);
  if (visible !== was) {
    setWas(visible);
    if (visible) setSession((n) => n + 1); // every opening starts at step 1
  }
  const { t } = useT();
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("svcRules.locTitle")} snaps={[0.86]}>
      <SheetBody key={session} onClose={onClose} onStarted={onStarted} />
    </BottomSheet>
  );
}

function SheetBody({ onClose, onStarted }: { onClose: () => void; onStarted?: () => void }) {
  const { t } = useT();
  const c = useColors();
  const { start, state } = useLocationSharing();
  const [step, setStep] = useState(0);
  const [fix, setFix] = useState<Fix | null>(null);
  const [locating, setLocating] = useState(false);
  const [failed, setFailed] = useState<LocErrorKind | null>(null);
  const [settings, setSettings] = useState(false); // permission refused for good → offer the system settings
  const [duration, setDuration] = useState<Duration>(1);
  const [sending, setSending] = useState(false);
  const [now] = useState(() => Date.now()); // the «HH:MM gacha» times count from the moment the sheet opened

  const locate = async () => {
    setFailed(null);
    setSettings(false);
    setLocating(true);
    try {
      let p = await readPermission();
      if (p.status !== "granted") p = await askPermission();
      if (p.status !== "granted") {
        setFailed("denied");
        setSettings(!p.canAskAgain);
        return;
      }
      setFix(await readPosition());
      setStep(2);
    } catch (e) {
      setFailed(e instanceof LocationFailure ? e.kind : "unavailable");
    } finally {
      setLocating(false);
    }
  };

  const confirm = async () => {
    if (!fix || sending) return;
    setSending(true);
    try {
      await start(duration, fix);
      toast(t("svcRules.locStarted"), "ok");
      onStarted?.();
      onClose();
    } catch {
      /* the store carries the error kind; shown below */
    } finally {
      setSending(false);
    }
  };

  const steps = [t("svcRules.locStepExplain"), t("svcRules.locStepAllow"), t("svcRules.locStepConfirm")];
  const bullets = [t("svcRules.locExplain1"), t("svcRules.locExplain2"), t("svcRules.locExplain3"), t("svcRules.locExplain4", { days: state.policy.retentionDays })];
  const acc = fix ? shownAccuracy(fix.accuracy) : null;
  const serverErr = step === 2 && state.error && !state.error.stop ? t(ERR[state.error.kind]) : "";

  return (
    <SheetScroll>
      <View style={s.stepper} accessibilityRole="progressbar" accessibilityLabel={t("svcRules.locStep", { n: step + 1, total: 3 })} accessibilityValue={{ min: 1, max: 3, now: step + 1 }}>
        {steps.map((label, i) => {
          const done = i < step;
          const cur = i === step;
          return (
            <View key={label} style={s.stepCol}>
              <View style={[s.bar, { backgroundColor: done || cur ? c.accent : c.surface2 }]} />
              <View style={s.stepLabel}>
                {done ? <Icon name="check" size={13} tone="accent" /> : null}
                <Text variant="caption" weight={cur ? "bold" : "regular"} tone={cur ? "ink" : "gray"} numberOfLines={1}>{`${i + 1}. ${label}`}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {step === 0 ? (
        <View style={s.group}>
          {bullets.map((b, i) => (
            <View key={i} style={s.bullet}>
              <View style={[s.bulletIc, { backgroundColor: c.tint2 }]}><Icon name={(["map-pin", "shield", "clock", "database"] as const)[i]} size={16} tone="accent" /></View>
              <Text variant="body" style={s.flex}>{b}</Text>
            </View>
          ))}
          <View style={s.footer}>
            <Button title={t("svcRules.locCancel")} variant="soft" onPress={onClose} style={s.flex} />
            <Button title={t("svcRules.locNext")} onPress={() => setStep(1)} style={s.flex} />
          </View>
        </View>
      ) : null}

      {step === 1 ? (
        <View style={s.group}>
          <View style={[s.hero, { backgroundColor: c.tint }]}>
            <View style={[s.heroIc, { backgroundColor: c.surface }]}><Icon name="navigation" size={26} tone="accent" /></View>
            <Text variant="small" tone="gray" center>{t("svcRules.locAllowHint")}</Text>
          </View>
          {failed ? (
            <View style={[s.note, { backgroundColor: c.errBg }]} accessibilityRole="alert" accessibilityLiveRegion="polite">
              <Text variant="small" tone="err">{t(ERR[failed])}</Text>
            </View>
          ) : null}
          {settings ? <Button title={t("svcRules.locOpenSettings")} variant="line" icon="settings" onPress={() => void Linking.openSettings()} full /> : null}
          <Button title={locating ? t("svcRules.locLocating") : failed && !settings ? t("svcRules.locRetry") : t("svcRules.locAllow")} icon="map-pin" loading={locating} disabled={locating} onPress={() => void locate()} full />
          <Button title={t("svcRules.locBack")} variant="ghost" onPress={() => setStep(0)} disabled={locating} full />
        </View>
      ) : null}

      {step === 2 ? (
        <View style={s.group}>
          <View style={[s.note, s.located, { backgroundColor: c.okBg }]}>
            <Icon name="check-circle" size={18} color={c.ok} />
            <Text variant="small" tone="ok" weight="bold" style={s.flex}>{t("svcRules.locLocated", { m: acc ?? "—" })}</Text>
            <PressableScale onPress={() => { setStep(1); setFix(null); }} accessibilityLabel={t("svcRules.locRetry")} style={s.retry}>
              <Text variant="small" tone="accent" weight="bold">{t("svcRules.locRetry")}</Text>
            </PressableScale>
          </View>
          <Text variant="h4">{t("svcRules.locDurationLabel")}</Text>
          <View style={s.tiles} accessibilityRole="radiogroup">
            {LOCATION_DURATIONS.map((h) => (
              <Tile key={h} on={duration === h} title={t("svcRules.locHours", { n: h })} hint={t("svcRules.locHoursHint", { time: clockTime(now + 3600_000 * h) })} onPress={() => setDuration(h)} />
            ))}
          </View>
          <Tile wide on={duration === null} title={t("svcRules.locManual")} hint={t("svcRules.locManualHint")} onPress={() => setDuration(null)} />
          {serverErr ? (
            <View style={[s.note, { backgroundColor: c.errBg }]} accessibilityRole="alert" accessibilityLiveRegion="polite">
              <Text variant="small" tone="err">{serverErr}</Text>
            </View>
          ) : null}
          <View style={s.footer}>
            <Button title={t("svcRules.locCancel")} variant="soft" onPress={onClose} disabled={sending} style={s.flex} />
            <Button title={sending ? t("svcRules.locStarting") : t("svcRules.locConfirm")} loading={sending} disabled={sending} onPress={() => void confirm()} style={s.flex} />
          </View>
        </View>
      ) : null}
    </SheetScroll>
  );
}

function Tile({ on, title, hint, onPress, wide }: { on: boolean; title: string; hint: string; onPress: () => void; wide?: boolean }) {
  const c = useColors();
  const { t } = useT();
  return (
    <PressableScale
      haptic={false}
      onPress={() => { selectHaptic(); onPress(); }}
      accessibilityRole="radio"
      accessibilityState={{ selected: on }}
      accessibilityLabel={t("svcRules.locA11yTile", { title, hint })}
      style={[s.tile, wide ? s.tileWide : null, { backgroundColor: on ? c.tint2 : c.surface, borderColor: on ? c.accent : c.line }]}
    >
      <Text variant="body" weight="bold" tone={on ? "accent" : "ink"}>{title}</Text>
      <Text variant="caption" tone="gray">{hint}</Text>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  stepper: { flexDirection: "row", gap: 8 },
  stepCol: { flex: 1, gap: 6 },
  bar: { height: 4, borderRadius: 2 },
  stepLabel: { flexDirection: "row", alignItems: "center", gap: 4, minHeight: 18 },
  group: { gap: 14 },
  bullet: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  bulletIc: { width: 32, height: 32, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  hero: { borderRadius: radius.rl, padding: 20, alignItems: "center", gap: 12 },
  heroIc: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  note: { borderRadius: radius.r, padding: 12 },
  located: { flexDirection: "row", alignItems: "center", gap: 8 },
  retry: { minHeight: 44, minWidth: 44, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { flexGrow: 1, flexBasis: "46%", minHeight: 60, borderRadius: radius.r, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 10, justifyContent: "center", gap: 2 },
  tileWide: { flexBasis: "100%" },
  footer: { flexDirection: "row", gap: 10, marginTop: 4 },
});
