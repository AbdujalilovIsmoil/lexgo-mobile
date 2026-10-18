import { Text , Input } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { OrderFormState } from "../model/useOrderForm";
import { ChannelPick } from "./ChannelPick";
import { DirectionPick } from "./DirectionPick";
import { KindSwitch } from "./KindSwitch";
import { LawyerCount } from "./LawyerCount";
import { OrderBanner } from "./OrderBanner";
import { OrderSummary } from "./OrderSummary";
import { PriorNote } from "./PriorNote";
import { StepCard } from "./StepCard";

// Everything the client answers on /urgent/new: the service banner, kind, channel, panel size, then two numbered questions
// (areas, the situation) and what happens next.
export function OrderForm({ f }: { f: OrderFormState }) {
  const { t } = useT();
  const s = f.service;
  if (!s) return null;
  const len = f.need.trim().length;
  return (
    <>
      <OrderBanner f={f} />
      {f.group ? <KindSwitch group={f.group} services={f.services} value={s.key} onPick={f.pick} /> : null}
      <ChannelPick channels={f.channels} value={f.channel} onChange={f.setPref} />
      {f.isGroup ? <LawyerCount value={f.count} min={s.lawyerCountMin || 2} max={s.lawyerCountMax || 7} onChange={f.setLawyers} /> : null}
      {s.requiresPriorPurchase ? <PriorNote /> : null}
      <DirectionPick value={f.dirs} onChange={(v) => { f.setDirs(v); f.setMiss(""); }} error={f.miss === "dirs"} />
      <StepCard n={2} title={t("ug2.need")} done={len >= f.minNeed} aside={<Text variant="caption" weight="bold" tone={len >= f.minNeed ? "ok" : "gray2"}>{len}/{f.minNeed}</Text>}>
        <Input
          value={f.need} multiline style={{ minHeight: 110, textAlignVertical: "top" }}
          onChangeText={(v) => { f.setNeed(v); if (v.trim().length >= f.minNeed) f.setMiss(""); }}
          placeholder={t("ug2.needPh")} hint={t("ug2.needHint", { n: f.minNeed })} error={f.miss === "need" ? t("ug2.missNeed", { n: f.minNeed }) : undefined}
        />
      </StepCard>
      <OrderSummary f={f} />
    </>
  );
}
