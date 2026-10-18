import { View } from "react-native";
import { PickRow, DIRECTIONS } from "@/entities/admin-support";
import { Button, Icon, Text } from "@/shared/ui";
import { FormInput } from "@/shared/form";
import { Field, FactRows, MultiChips, SelectField } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { NEED_MAX } from "./useDocFlow";
import type { useUrgentFlow } from "./useUrgentFlow";

type Flow = ReturnType<typeof useUrgentFlow>;

// Fields of the urgent request; the quote under the need shows length, per-lawyer price and total.
export function UrgentForm({ f }: { f: Flow }) {
  const { t } = useT();
  const { v, svc } = f;
  const kindBad = f.bad.kind || (f.channels.length <= 1 ? f.bad.channel : "") || (!f.group ? f.bad.count : "");
  return (
    <View style={{ gap: 14 }}>
      <Text variant="small" tone="gray">{t("admSupC.urgent.lead")}</Text>
      <Field label={t("admSupC.urgent.kind")} error={kindBad}>
        <View style={{ gap: 8 }}>
          {f.catalog.services.map((s) => (
            <PickRow key={s.key} title={t(`admSupC.urgent.kinds.${s.key}`)} hint={[s.immediate ? t("admSupC.urgent.immediate") : "", s.priorPurchase ? t("admSupC.urgent.prior") : ""].filter(Boolean).join(" · ")} selected={v.kind === s.key} onPress={() => f.set({ kind: s.key, count: Math.max(v.count, 3) })} />
          ))}
        </View>
      </Field>
      {svc && f.channels.length > 1 ? <SelectField label={t("admSupC.urgent.channel")} value={f.channel} options={f.channels.map((c) => ({ value: c, label: t(`admSupC.urgent.ch.${c}`) }))} onChange={(channel) => f.set({ channel })} error={f.bad.channel} /> : null}
      {f.group ? (
        <Field label={t("admSupC.urgent.count")} error={f.bad.count} hint={t("admSupC.urgent.range", { min: f.min, max: f.max })}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <Button title="−" variant="line" size="sm" onPress={() => f.set({ count: f.lawyers - 1 })} disabled={f.lawyers <= f.min} />
            <Text variant="h4">{f.lawyers}</Text>
            <Button title="+" variant="line" size="sm" onPress={() => f.set({ count: f.lawyers + 1 })} disabled={f.lawyers >= f.max} />
          </View>
        </Field>
      ) : null}
      <Field label={t("admSupC.urgent.directions")} error={f.bad.directions} hint={t("admSupC.urgent.directionsHint")}>
        <MultiChips options={DIRECTIONS.map((d) => ({ value: d.slug, label: t(`admSupC.urgent.areas.${d.area}`) }))} value={v.dirs} onChange={(dirs) => f.set({ dirs })} />
      </Field>
      <FormInput control={f.form.control} name="need" label={t("admSupC.urgent.need")} placeholder={t("admSupC.urgent.needPh")} multiline maxLength={NEED_MAX} hint={`${v.need.length}/${NEED_MAX}`} />
      {svc ? (
        <View style={{ gap: 8 }}>
          <FactRows rows={[
            { label: t("admSupC.urgent.meeting"), value: f.minutes > 0 ? t("admSupC.urgent.minutes", { n: f.minutes }) : "" },
            { label: t("admSupC.urgent.perLawyer"), value: f.group && f.price > 0 ? `${f.sum(f.price / f.lawyers)} × ${f.lawyers}` : "" },
            { label: t("admSupC.plan.total"), value: f.price > 0 ? f.sum(f.price) : "—" },
          ]} />
          {!f.catalog.priced ? <NoteLine icon="alert-triangle" text={t("admSupC.urgent.catalogOff")} /> : null}
          {svc.immediate ? <NoteLine icon="zap" text={t("admSupC.urgent.immediateNote")} /> : null}
          {svc.priorPurchase ? <NoteLine icon="lock" text={t("admSupC.urgent.priorNote")} /> : null}
        </View>
      ) : null}
    </View>
  );
}

function NoteLine({ icon, text }: { icon: "alert-triangle" | "zap" | "lock"; text: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
      <Icon name={icon} size={15} tone="gray" />
      <Text variant="caption" tone="gray" style={{ flex: 1 }}>{text}</Text>
    </View>
  );
}
