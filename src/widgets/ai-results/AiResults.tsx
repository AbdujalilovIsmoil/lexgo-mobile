import { useTabHeader } from "@/widgets/tab-page";
import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { MarketCard, LawyerCardSkeleton, useAiRows, useAiSearch, MIN_AI_CHARS } from "@/entities/lawyer";
import { useLawyerFilterStore } from "@/features/lawyer-filter";
import { Button, EmptyState, ErrorView } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { AiBanner } from "./AiBanner";
import { AiIntro } from "./AiIntro";

type Props = { header: React.ReactElement; onOpen: (id: string) => void; onExample: (text: string) => void; onOff: () => void };

// AI mode of the Lawyers tab: the submitted sentence → ranked specialists, each with
// match % and reasons. Same header (search + chips) as the normal list.
export function AiResults({ header, onOpen, onExample, onOff }: Props) {
  const top = useTabHeader(16);
  const { t } = useT();
  const insets = useInsets();
  const router = useRouter();
  const authed = useIsAuthed();
  const { aiQuery, filters } = useLawyerFilterStore();
  const q = useAiSearch(aiQuery, filters.region, filters.kind === "all" ? "" : filters.kind, authed);
  const { rows, loading } = useAiRows(q.data?.matches ?? []);
  const idle = aiQuery.length < MIN_AI_CHARS;
  const guest = !authed && !idle;
  const busy = !idle && (q.isLoading || (loading && !rows.length));
  const body = guest ? <EmptyState icon="lock" title={t("mk1.aiLogin")} actionLabel={t("auth.submit")} onAction={() => router.push("/auth/login")} />
    : idle ? <AiIntro onExample={onExample} /> : busy ? <View style={s.gap}>{[0, 1, 2].map((i) => <LawyerCardSkeleton key={i} />)}</View>
    : q.isError ? <ErrorView error={q.error} onRetry={() => void q.refetch()} />
    : <EmptyState icon="search" title={t("mk1.aiNone")} text={t("mk1.aiNoneText")} actionLabel={t("mk1.aiOff")} onAction={onOff} />;
  return (
    <FlatList
      data={guest || busy || q.isError ? [] : rows}
      keyExtractor={(r) => r.lawyer.userId}
      renderItem={({ item }) => <MarketCard lawyer={item.lawyer} match={item.match} onPress={() => onOpen(item.lawyer.userId)} />}
      ListHeaderComponent={<View>{top}{header}{idle || guest ? null : <AiBanner thinking={busy} found={rows.length} summary={q.data?.summary ?? ""} disclaimer={q.data?.disclaimer ?? ""} />}</View>}
      ListEmptyComponent={body}
      ListFooterComponent={rows.length ? <Button title={t("mk1.aiOff")} onPress={onOff} variant="soft" full style={s.more} /> : null}
      ItemSeparatorComponent={() => <View style={s.sep} />}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 130 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    />
  );
}

const s = StyleSheet.create({
  sep: { height: 12 },
  gap: { gap: 12 },
  more: { marginTop: 14 },
});
