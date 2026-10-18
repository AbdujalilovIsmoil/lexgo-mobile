import { View } from "react-native";
import type { CardSub } from "@/entities/admin-callcenter";
import { usePlans } from "@/entities/admin-support";
import { Text } from "@/shared/ui";
import { SectionCard, StatusPill } from "@/shared/ui/admin";
import { fmtDate } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

const LIVE = new Set(["active", "pending_payment", "trialing", "past_due"]);

// The client's subscriptions with what each plan includes (plan names / features come from the public plan list).
export function ClientSubs({ subs }: { subs: CardSub[] }) {
  const { t, locale } = useT();
  const plans = usePlans(locale, true).data ?? [];
  const live = subs.filter((s) => LIVE.has(s.status));
  return (
    <SectionCard title={t("cc2.subs")}>
      {live.length ? null : <Text variant="small" tone="gray">{t("cc2.noSub")}</Text>}
      {live.map((s) => {
        const plan = plans.find((p) => p.id === s.planId);
        return (
          <View key={s.id} style={{ gap: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <Text variant="body" weight="bold" style={{ flex: 1 }} numberOfLines={2}>{plan?.name || t("cc2.plan")}</Text>
              <StatusPill status={s.status} />
            </View>
            {s.endsAt ? <Text variant="caption" tone="gray">{t("cc2.until", { date: fmtDate(s.endsAt, locale) })}</Text> : null}
            {(plan?.features ?? []).slice(0, 3).map((f) => <Text key={f} variant="caption" tone="gray2" numberOfLines={2}>• {f}</Text>)}
          </View>
        );
      })}
    </SectionCard>
  );
}
