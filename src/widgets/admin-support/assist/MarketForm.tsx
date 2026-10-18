import { View } from "react-native";
import { PickRow } from "@/entities/admin-support";
import { Segmented, Skeleton, Text } from "@/shared/ui";
import { FormInput } from "@/shared/form";
import { Field, SelectField } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { MarketOptions } from "./MarketOptions";
import { PackagePick } from "./PackagePick";
import { SellerPicker } from "./SellerPicker";
import { useSum } from "./useSum";
import type { useMarketFlow } from "./useMarketFlow";

const CHANNELS = ["chat", "audio", "video", "meeting"];

// Seller, service, preferred channel and time, and a short note about the client's situation.
export function MarketForm({ f }: { f: ReturnType<typeof useMarketFlow> }) {
  const { t } = useT();
  const sum = useSum();
  return (
    <View style={{ gap: 14 }}>
      <Text variant="small" tone="gray">{t("admSupC.market.lead")}</Text>
      <Segmented options={[{ value: "service", label: t("ntd.ccV2.market.kindService") }, { value: "package", label: t("ntd.ccV2.market.kindPackage") }]} value={f.kind} onChange={f.pickKind} />
      {f.isPkg ? <Field label={t("ntd.ccV2.market.package")}><PackagePick f={f} /></Field> : null}
      <Field label={t("admSupC.market.seller")}><SellerPicker f={f} /></Field>
      {f.seller && !f.isPkg ? (
        <Field label={t("admSupC.market.service")}>
          <View style={{ gap: 8 }}>
            {f.svcQ.isLoading && !f.items.length ? <Skeleton height={52} round={14} /> : null}
            {f.items.map((s) => <PickRow key={s.id} title={s.title} hint={s.categoryTitle} right={sum(s.price, s.currency)} selected={f.service?.id === s.id} onPress={() => f.pickService(s.id)} />)}
            {!f.svcQ.isLoading && !f.items.length ? <Text variant="small" tone="gray">{t("admSupC.market.noServices")}</Text> : null}
          </View>
        </Field>
      ) : null}
      <MarketOptions f={f} />
      <Text variant="caption" tone="gray">{t("ntd.ccV2.market.notice")}</Text>
      <SelectField label={t("admSupC.market.channel")} value={f.v.channel} options={CHANNELS.map((c) => ({ value: c, label: t(`admSupC.market.ch.${c}`) }))} onChange={(channel) => f.set({ channel })} />
      <FormInput control={f.form.control} name="time" label={t("admSupC.market.time")} placeholder={t("admSupC.market.timePh")} maxLength={120} />
      <FormInput control={f.form.control} name="note" label={t("adm.note")} placeholder={t("admSupC.market.notePh")} multiline maxLength={1000} hint={`${f.v.note.length}/1000`} />
      {f.err ? <Text variant="small" tone="err">{f.err}</Text> : null}
    </View>
  );
}
