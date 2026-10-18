import type { Invite } from "@/entities/pro-referrals";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { tOr } from "@/shared/lib/pro/tOr";
import { Pill, Text } from "@/shared/ui";
import { RowCard } from "@/shared/ui/admin";

// Invitation list: who, status, reward and when they joined.
export function Invites({ items }: { items: Invite[] }) {
  const { t, locale } = useT();
  if (!items.length) return <Text variant="small" tone="gray" center>{t("aw10.empty")}</Text>;
  return (
    <>
      {items.map((x, i) => (
        <RowCard key={`${x.phone}-${i}`} avatar={x.name || x.phone || "?"} title={x.name || x.phone || "—"} subtitle={[x.name ? x.phone : "", tOr(t, `aw10.st.${x.status}`, x.status)].filter(Boolean).join(" · ")} meta={fmtDate(x.joinedAt, locale)} right={x.reward ? <Pill small tone="ok" label={`+${fmtMoney(x.reward)}`} /> : undefined} />
      ))}
    </>
  );
}
