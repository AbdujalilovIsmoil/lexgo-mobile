import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { BestMatchCard, RankedMatchRow, useMyMatches, type MyMatch } from "@/entities/lawyer";
import { Divider, EmptyState, ErrorView, Header, Screen, Skeleton, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { useInstructorTarget } from "@/shared/instructor";

// Client matches (web /portal/client/matches): GET /matching/me as a ranking: the best pick as a hero card, the others
// below it as numbered rows with their match percentage; empty state sends the client to describe the problem.
export function MatchesPage() {
  const c = useColors();
  const { t } = useT();
  const router = useRouter();
  const q = useMyMatches(true);
  const list = useInstructorTarget("matches:list", { label: t("cxMt.title"), type: "list" });
  const open = (m: MyMatch) => router.push({ pathname: "/specialist/[id]", params: { id: m.userId || m.id } });
  const [best, ...rest] = q.data ?? [];
  return (
    <View style={[s.fill, { backgroundColor: c.canvas }]}>
      <Header title={t("cxMt.title")} />
      <Screen topInset={false} contentContainerStyle={s.content} refreshing={q.isRefetching} onRefresh={() => void q.refetch()}>
        <Text variant="small" tone="gray">{q.data?.length ? t("mpx.found", { n: q.data.length }) : t("cxMt.subtitle")}</Text>
        <View {...list} style={s.list}>
          {q.isLoading ? <><Skeleton height={260} round={20} />{[0, 1, 2].map((i) => <Skeleton key={i} height={64} round={14} />)}</>
            : q.isError ? <ErrorView error={q.error} onRetry={() => void q.refetch()} />
            : !best ? <EmptyState icon="zap" title={t("cxMt.empty")} text={t("cxMt.emptyText")} actionLabel={t("cxMt.describe")} onAction={() => router.push("/ai")} />
            : <>
              <BestMatchCard match={best} onPress={() => open(best)} />
              {rest.length ? <Text variant="h4" style={s.sub}>{t("mpx.others")}</Text> : null}
              <View>{rest.map((m, i) => <View key={m.id || m.userId}>{i ? <Divider inset={30} /> : null}<RankedMatchRow rank={i + 2} match={m} onPress={() => open(m)} /></View>)}</View>
            </>}
        </View>
      </Screen>
    </View>
  );
}

const s = StyleSheet.create({ fill: { flex: 1 }, content: { gap: 14, paddingTop: 4 }, list: { gap: 12 }, sub: { marginTop: 6 } });
