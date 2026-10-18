import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { opensComplaint, StarInput, type RateTarget } from "@/entities/rating";
import { Button, Card, Icon, Pill, Text } from "@/shared/ui";
import { FormInput, useAppForm, useFieldError } from "@/shared/form";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { useCountdown } from "../model/useCountdown";
import { rateSchema } from "./rateSchema";

type Props = { bare?: boolean; target: RateTarget; busy: boolean; onSubmit: (stars: number, comment: string, complaint: string) => void; onExpired: () => void };

// 1–5 stars with an optional comment; at 1–2 stars the complaint text is asked for right here, while
// the work is still open (after the send there is nothing left to attach it to).
export function RateForm({ bare, target, busy, onSubmit, onExpired }: Props) {
  const c = useColors();
  const { t } = useT();
  const tr = useFieldError();
  const f = useAppForm(rateSchema, { stars: 0, comment: "", complaint: "" });
  const stars = f.watch("stars");
  const submit = f.handleSubmit((v) => onSubmit(v.stars, v.comment, opensComplaint(v.stars) ? v.complaint : ""));
  const timed = target.kind !== "review";
  const cd = useCountdown(timed ? target.window : null);
  const gone = timed && !cd.open;
  useEffect(() => {
    if (gone) onExpired();
  }, [gone, onExpired]);
  const low = opensComplaint(stars);
  const Wrap = bare ? View : Card;
  return (
    <Wrap style={s.card}>
      <View style={s.head}>
        {bare ? <View style={s.title} /> : <Text variant="h4" style={s.title}>{t("py10.rate.title")}</Text>}
        {timed ? <Pill label={t("py10.rate.left", { time: cd.label })} tone={cd.left < 120000 ? "warn" : "cy"} icon="clock" small /> : null}
      </View>
      <StarInput value={stars} onChange={(n) => f.setValue("stars", n, { shouldValidate: true })} disabled={busy} />
      <Text variant="small" tone={f.formState.errors.stars ? "err" : "gray"} center style={s.word}>{f.formState.errors.stars ? tr(f.formState.errors.stars.message) : stars ? t(`py10.rate.w${stars}`) : t("py10.rate.pick")}</Text>
      <FormInput control={f.control} name="comment" placeholder={t("py10.rate.commentPh")} maxLength={500} editable={!busy} />
      {low ? (
        <View style={[s.low, { backgroundColor: c.warnBg }]}>
          <View style={s.lowHead}><Icon name="alert-triangle" size={16} color={c.warn} /><Text variant="small" weight="bold" style={{ color: c.warn }}>{t("py10.rate.lowTitle")}</Text></View>
          <FormInput control={f.control} name="complaint" placeholder={t("py10.rate.lowPh")} multiline numberOfLines={3} maxLength={2000} editable={!busy} style={s.area} />
          <Text variant="caption" tone="gray">{t("py10.rate.lowHint")}</Text>
        </View>
      ) : null}
      <Button title={t("py10.rate.submit")} icon="send" variant="gradient" full loading={busy} onPress={() => void submit()} />
    </Wrap>
  );
}

const s = StyleSheet.create({
  card: { gap: 14 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { flex: 1 },
  word: { marginTop: -6, minHeight: 18 },
  low: { gap: 8, padding: 12, borderRadius: 16 },
  lowHead: { flexDirection: "row", alignItems: "center", gap: 6 },
  area: { minHeight: 80, textAlignVertical: "top" },
});
