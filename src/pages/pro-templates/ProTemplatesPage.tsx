import { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { matchTemplates, shareTemplate, useTemplates, type DocTemplate } from "@/entities/doc-template";
import { useT } from "@/shared/i18n";
import { useInsets } from "@/shared/lib/insets";
import { EmptyState, ErrorView, IconButton, Skeleton, toast } from "@/shared/ui";
import { AdminPage, RowCard, SearchBox } from "@/shared/ui/admin";

// /pro/templates — the document template catalogue (the web portal's "Hujjatlar" for a yurist): search, and each template as a PDF to save or share.
export default function ProTemplatesPage() {
  const { t } = useT();
  const insets = useInsets();
  const q = useTemplates();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState("");
  const rows = useMemo(() => matchTemplates(q.data ?? [], text), [q.data, text]);
  const get = async (x: DocTemplate) => {
    if (busy) return;
    setBusy(x.id);
    try { await shareTemplate(x); } catch { toast(t("tpl.fail"), "err"); } finally { setBusy(""); }
  };
  return (
    <AdminPage title={t("lsb.documents")} subtitle={t("tpl.lead")}>
      {q.isLoading ? <Skeleton height={72} round={20} style={s.sk} /> : q.isError ? <ErrorView error={q.error} onRetry={() => void q.refetch()} /> : (
        <FlatList
          data={rows}
          keyExtractor={(x) => x.id}
          ListHeaderComponent={<SearchBox value={text} onChangeText={setText} placeholder={t("tpl.search")} />}
          ListEmptyComponent={<EmptyState icon="file-text" title={t("tpl.empty")} text={t("tpl.emptyText")} />}
          ItemSeparatorComponent={() => <ViewGap />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24, gap: 0 }}
          refreshing={q.isRefetching}
          onRefresh={() => void q.refetch()}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => <RowCard icon="file-text" title={item.name} subtitle={[item.category, item.language.toUpperCase()].filter(Boolean).join(" · ")} right={<IconButton icon="download" label={t("tpl.download")} size={40} onPress={() => void get(item)} badge={busy === item.id} />} onPress={() => void get(item)} />}
        />
      )}
    </AdminPage>
  );
}

const ViewGap = () => <View style={{ height: 10 }} />;
const s = StyleSheet.create({ sk: { margin: 16 } });
