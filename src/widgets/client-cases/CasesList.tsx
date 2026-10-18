import { useState } from "react";
import { FlatList, View } from "react-native";
import { EmptyState, ErrorView, Skeleton } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { ClientCase, useCaseItems } from "@/entities/client-case";
import { CaseCard } from "./CaseCard";
import { DocsSheet } from "./DocsSheet";
import { OpenDocuments } from "./OpenDocuments";
import { RequestSheet } from "./RequestSheet";

type Props = { cases: ReturnType<typeof useCaseItems>; bottom: number };

// "Open documents" block, then every case / order, with the request and documents sheets.
export function CasesList({ cases, bottom }: Props) {
  const { t } = useT();
  const [req, setReq] = useState<ClientCase | null>(null);
  const [docs, setDocs] = useState<ClientCase | null>(null);
  const body = cases.isLoading ? <View style={{ gap: 10 }}><Skeleton height={130} round={20} /><Skeleton height={130} round={20} /></View>
    : cases.isError ? <ErrorView error={cases.error} onRetry={cases.refetch} />
    : <EmptyState icon="briefcase" title={t("ccs.empty")} text={t("ccs.emptyText")} />;
  return (
    <>
      <FlatList
        data={cases.isLoading ? [] : cases.items}
        keyExtractor={(i) => i.key}
        renderItem={({ item }) => <CaseCard item={item} onDocs={setDocs} onRequest={setReq} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={<View style={{ paddingBottom: 12 }}><OpenDocuments /></View>}
        ListEmptyComponent={body}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottom, flexGrow: 1 }}
        refreshing={cases.isRefetching}
        onRefresh={cases.refetch}
        showsVerticalScrollIndicator={false}
      />
      <RequestSheet target={req} onClose={() => setReq(null)} />
      <DocsSheet target={docs} onClose={() => setDocs(null)} />
    </>
  );
}
