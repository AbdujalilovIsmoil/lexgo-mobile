import type { Compose, Mode } from "@/features/admin-notify";
import { CcHero } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";

type Props = { mode: Mode; count: number; role: string; compose: Compose };

// What is about to be sent: to whom (picked people or a whole role), on which channel, under which category.
export function NotifyHero({ mode, count, role, compose }: Props) {
  const { t } = useT();
  const to = mode === "broadcast" ? t(`admNtf.roles.${role}`) : count ? t("admNtfB.peopleN", { n: count }) : "—";
  return (
    <CcHero
      stats={[
        { value: to, label: t("admNtfB.to") },
        { value: t(`admNtf.channels.${compose.channel}`), label: t("admNtf.channel") },
        { value: t(`admNtf.cats.${compose.category}`), label: t("admNtf.category") },
      ]}
    />
  );
}
