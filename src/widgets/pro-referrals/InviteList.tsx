import { useState } from "react";
import { Share, StyleSheet, View } from "react-native";
import { inviteKind, inviteSub, inviteTitle, monogram, shareMessage, type Invite, type InviteKind, type Referral } from "@/entities/pro-referrals";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { growWindow, nextCount, PAGE } from "@/shared/lib/pageWindow";
import { radius, useColors } from "@/shared/theme";
import { Button, EmptyState, Pill, Text, type PillTone } from "@/shared/ui";

const TONE: Record<InviteKind, PillTone> = { pending: "warn", registered: "cy", active: "ok" };
const LABEL: Record<InviteKind, string> = { pending: "refUx.stPending", registered: "refUx.stRegistered", active: "refUx.stActive" };

function Row({ x, last }: { x: Invite; last: boolean }) {
  const { t, locale } = useT();
  const c = useColors();
  const kind = inviteKind(x.status);
  const title = inviteTitle(x) || "—";
  const sub = [inviteSub(x), fmtDate(x.joinedAt, locale)].filter(Boolean).join(" · ");
  return (
    <View accessible accessibilityLabel={`${title}, ${t(LABEL[kind])}${sub ? `, ${sub}` : ""}`} style={[s.row, !last && { borderBottomColor: c.line, borderBottomWidth: 1 }]}>
      <View style={[s.ava, { backgroundColor: c.tint2 }]}>
        <Text variant="h4" tone="accent">{monogram(x)}</Text>
      </View>
      <View style={s.mid}>
        <Text variant="body" weight="semibold" numberOfLines={1}>{title}</Text>
        {sub ? <Text variant="caption" tone="gray" numberOfLines={1}>{sub}</Text> : null}
      </View>
      <View style={s.end}>
        <Pill small label={t(LABEL[kind])} tone={TONE[kind]} />
        {x.reward ? <Text variant="caption" tone="ok" weight="semibold">{`+${fmtMoney(x.reward)}`}</Text> : null}
      </View>
    </View>
  );
}

// Invitations 10 at a time; the empty state nudges to share.
export function InviteList({ r }: { r: Referral }) {
  const { t } = useT();
  const c = useColors();
  const [shown, setShown] = useState(PAGE);
  const total = r.items.length;
  const visible = r.items.slice(0, shown);
  const left = nextCount(visible.length, total);
  const share = () => void Share.share({ message: shareMessage(t("aw10.shareText"), r.code, r.link) }).catch(() => {});
  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <Text variant="h4">{t("refUx.listTitle")}</Text>
        {total ? <Text variant="caption" tone="gray">{t("refUx.shown", { a: visible.length, b: total })}</Text> : null}
      </View>
      {total === 0 ? (
        <EmptyState compact icon="user-plus" title={t("refUx.emptyTitle")} text={t("refUx.emptyText")} actionLabel={r.code || r.link ? t("refUx.emptyCta") : undefined} onAction={share} />
      ) : (
        <View style={[s.list, { backgroundColor: c.surface, borderColor: c.line }]}>
          {visible.map((x, i) => <Row key={`${x.phone}-${x.joinedAt}-${i}`} x={x} last={i === visible.length - 1} />)}
        </View>
      )}
      {left > 0 ? <Button variant="soft" title={t("refUx.more", { n: left })} icon="chevron-down" full onPress={() => setShown((n) => growWindow(n, total))} /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 12 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  list: { borderRadius: radius.rl, borderWidth: 1, paddingHorizontal: 14, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 64, paddingVertical: 10 },
  ava: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  mid: { flex: 1, gap: 2 },
  end: { alignItems: "flex-end", gap: 4 },
});
