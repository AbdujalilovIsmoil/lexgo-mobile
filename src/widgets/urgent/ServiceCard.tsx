import { Pill } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { channelsOf, kindIcon, kindTint, minutesOf, useUrgentLabels, VIDEO_GROUP, type UrgentCard } from "@/entities/urgent";
import { FeatureTile } from "./FeatureTile";
import { ServiceTile } from "./ServiceTile";


// One box of the service list (the ticket; the "straight to the advocate" ones are lit): icon, name, one sentence, the channels / length / "instant" / kinds / lock pills, and how it is delivered.
export function ServiceCard({ card, onPress }: { card: UrgentCard; onPress: () => void }) {
  const { t } = useT();
  const label = useUrgentLabels();
  const first = card.items[0];
  const group = !!card.group;
  const title = group ? label.text(`ug1.groups.${card.key}`, card.group?.title ?? card.key) : label.kind(first.key, first.title);
  const chans = [...new Set(card.items.flatMap(channelsOf))];
  const mins = Math.max(...card.items.map((x) => minutesOf(x, channelsOf(x)[0] ?? "video")));
  const now = card.items.every((x) => x.immediateCall);
  const agree = now || card.items.every((x) => !x.immediateCall);
  const base = card.key === VIDEO_GROUP ? "video_consultation" : first.key;
  const pills = (
    <>
      {chans.includes("video") ? <Pill small tone="gray" icon="video" label={t("ug4.ch.video")} /> : null}
      {chans.includes("chat") ? <Pill small tone="gray" icon="message-circle" label={t("ug4.ch.chat")} /> : null}
      {mins ? <Pill small tone="gray" icon="clock" label={t("ug4.minutesN", { n: mins })} /> : null}
      {now ? <Pill small tone="warn" icon="zap" label={t("ug4.now")} /> : null}
      {group ? <Pill small tone="cy" icon="layers" label={t("ug1.kindsN", { n: card.items.length })} /> : null}
      {first.requiresPriorPurchase ? <Pill small tone="warn" icon="lock" label={t("ug1.priorShort")} /> : null}
    </>
  );
  const Tile = now ? ServiceTile : FeatureTile;
  return <Tile icon={kindIcon(base)} tint={kindTint(base)} title={title} lead={t(`ug1.about.${card.key}`)} pills={pills} hintIcon={now ? "zap" : agree ? "clock" : "shuffle"} hint={t(agree ? (now ? "ntd.ugDelNow" : "ntd.ugDelPool") : "ntd.ugDelVaries")} onPress={onPress} />;
}
