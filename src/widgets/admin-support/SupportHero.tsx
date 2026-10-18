import { isUrgent, isWaiting, TINT, useSupportQueue, useWaitShort, type SupportTab } from "@/entities/admin-support";
import { CcHero } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";

type Counts = Record<SupportTab, number | undefined>;

// Headline of the desk: chats waiting for an operator, how long the oldest has waited, how many of the loaded ones are urgent, and the split by queue.
export function SupportHero({ counts }: { counts: Counts }) {
  const { t } = useT();
  const short = useWaitShort();
  const { items } = useSupportQueue("new");
  const waiting = items.filter((x) => isWaiting(x.status));
  const urgent = waiting.filter((x) => isUrgent(x.priority)).length;
  const n = (k: SupportTab) => counts[k] ?? 0;
  const seg = (k: SupportTab, color: string) => ({ key: k, value: n(k), color, label: `${t(`admSup.tabs.${k}`)} ${n(k)}` });
  return (
    <CcHero
      stats={[
        { value: String(n("new")), label: t("admSup.tabs.new"), color: n("new") ? TINT.warn : undefined },
        { value: waiting[0] ? short(waiting[0].createdAt) : "—", label: t("admSup.hero.oldest"), color: waiting[0] ? TINT.warn : undefined },
        { value: String(urgent), label: t("admSup.urgent"), color: urgent ? TINT.err : undefined },
      ]}
      segments={[seg("new", TINT.warn), seg("mine", TINT.blue), seg("transferred", TINT.violet), seg("closed", TINT.gray)]}
    />
  );
}
