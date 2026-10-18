import { useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { useReferral } from "@/entities/pro-referrals";
import { useInsets } from "@/shared/lib/insets";
import { radius } from "@/shared/theme";
import { ErrorView, Skeleton } from "@/shared/ui";
import { HowStrip } from "./HowStrip";
import { InviteCard } from "./InviteCard";
import { InviteList } from "./InviteList";
import { LadderTrack } from "./LadderTrack";
import { QrSheet } from "./QrSheet";
import { StatTiles } from "./StatTiles";

// Growth screen: invite card, commission track, stats, invitations, how it works.
export function ReferralPanel() {
  const insets = useInsets();
  const q = useReferral();
  const [qr, setQr] = useState(false);
  if (q.isError && !q.data) return <ErrorView error={q.error} onRetry={() => void q.refetch()} />;
  const r = q.data;
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: insets.bottom + 40 }} refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} />} showsVerticalScrollIndicator={false}>
      {r ? <InviteCard r={r} onQr={() => setQr(true)} /> : <Skeleton height={176} round={radius.rx} />}
      {r ? <LadderTrack active={r.joined} /> : <Skeleton height={300} round={radius.rl} />}
      <StatTiles r={r} />
      {r ? (
        <InviteList r={r} />
      ) : (
        <View style={{ gap: 10 }}>
          {[0, 1, 2].map((i) => <Skeleton key={i} height={64} round={radius.r} />)}
        </View>
      )}
      <HowStrip />
      {r ? <QrSheet visible={qr} onClose={() => setQr(false)} qrPath={r.qrPath} code={r.code} /> : null}
    </ScrollView>
  );
}
