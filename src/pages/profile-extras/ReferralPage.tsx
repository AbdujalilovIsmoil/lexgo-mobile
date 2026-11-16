import { StyleSheet } from "react-native";
import { ReferralHero } from "@/widgets/profile-extras";
import { useReferral } from "@/entities/profile-extras";
import { AdminPage, QueryBoundary } from "@/shared/ui/admin";
import { useClientFrame } from "@/widgets/client-dash";
import { PayScroll } from "@/shared/ui/pay/PayScroll";
import { ListGroup, Text } from "@/shared/ui";
import { fmtUzs } from "@/entities/payment";
import { fmtDate } from "@/shared/lib/format";
import { tOr } from "@/shared/lib/pay/tOr";
import { useT } from "@/shared/i18n";

// Referral (Adliya): one line about the reward, the numbers as a grouped card (joined of the goal, the discount and whether it is on,
// invited, bonus), the invitation card (code, QR, share / copy) and who joined.
export function ReferralPage() {
  const { t, locale } = useT();
  const frame = useClientFrame();
  const q = useReferral();
  const r = q.data;
  const goal = r ? r.eligibleAfter || 5 : 5;
  const pct = r?.discountPercent || 0;
  return (
    <AdminPage {...frame} title={t("profile.pp.referral")}>
      <QueryBoundary query={q}>
        <PayScroll refreshing={q.isRefetching} onRefresh={() => void q.refetch()}>
          {r ? (
            <>
              <Text variant="body" tone="gray" style={s.lead}>{r.discountUnlocked ? t("py7.ref.discountOn", { pct }) : t("py7.ref.discountLeft", { n: Math.max(0, r.remaining || goal - r.joined), pct })}</Text>
              <ListGroup items={[
                { key: "joined", title: t("py7.ref.joined"), sub: `${Math.min(r.joined, goal)} / ${goal}` },
                ...(pct ? [{ key: "discount", title: t("py7.ref.discountShort"), sub: t(r.discountUnlocked ? "py7.ref.pctOn" : "py7.ref.pctOff", { pct }) }] : []),
                { key: "invited", title: t("py7.ref.invited"), sub: String(r.invited) },
                ...(r.reward ? [{ key: "reward", title: t("py7.ref.reward"), sub: fmtUzs(r.reward, t) }] : []),
              ]} />
              <ReferralHero r={r} />
            </>
          ) : null}
          <Text variant="h4" style={s.h}>{t("py7.ref.invites")}</Text>
          {r && r.items.length ? (
            <ListGroup items={r.items.map((it, i) => ({
              key: String(i),
              title: it.name || it.phone || "—",
              sub: [it.name ? it.phone : "", tOr(t, "py7.ref.status", it.status), fmtDate(it.joinedAt, locale)].filter(Boolean).join(" · "),
              right: it.reward ? <Text variant="small" weight="bold" tone="ok">+{fmtUzs(it.reward, t)}</Text> : undefined,
            }))} />
          ) : <Text variant="small" tone="gray2">{t("py7.ref.none")}</Text>}
        </PayScroll>
      </QueryBoundary>
    </AdminPage>
  );
}

const s = StyleSheet.create({ lead: { fontSize: 15, lineHeight: 21 }, h: { fontSize: 17, marginTop: 4 } });
