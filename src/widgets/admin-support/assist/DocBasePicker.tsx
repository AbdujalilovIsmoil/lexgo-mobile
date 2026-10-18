import { View } from "react-native";
import { PickRow, type DocService } from "@/entities/admin-support";
import { Button, Icon, Input, Skeleton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useSum } from "./useSum";
import type { useDocFlow } from "./useDocFlow";

type Flow = ReturnType<typeof useDocFlow>;

// "What is the document based on": a catalogue service (with its template) or an empty sheet.
export function DocBasePicker({ f }: { f: Flow }) {
  const { t } = useT();
  const sum = useSum();
  const hint = (s: DocService) => [s.templateId ? t("admSupC.doc.withTemplate") : "", s.categoryTitle].filter(Boolean).join(" · ");
  if (f.base) {
    return (
      <PickRow selected title={f.service ? f.service.name : t("admSupC.doc.scratch")} hint={f.service ? hint(f.service) : t("admSupC.doc.scratchHint")} right={t("admSupC.doc.change")} onPress={f.clearBase} />
    );
  }
  const term = f.v.q.trim();
  return (
    <View style={{ gap: 8 }}>
      <Input value={f.v.q} onChangeText={(q) => f.set({ q })} placeholder={t("admSupC.doc.searchPh")} maxLength={120} autoCapitalize="none" autoCorrect={false} left={<Icon name="search" size={18} tone="gray" />} />
      <PickRow title={t("admSupC.doc.scratch")} hint={t("admSupC.doc.scratchHint")} onPress={() => f.pick({ service: null })} />
      {term.length >= 2 && f.found.isLoading ? <Skeleton height={52} round={14} /> : null}
      {term.length >= 2 ? (f.found.data ?? []).map((s) => <PickRow key={s.id} title={s.name} hint={hint(s)} right={s.price ? sum(s.price) : undefined} onPress={() => f.pick({ service: s })} />) : null}
      {term.length >= 2 && f.found.isError ? <Button title={t("common.retry")} variant="soft" size="sm" onPress={() => void f.found.refetch()} /> : null}
      {term.length >= 2 && f.found.isSuccess && !f.found.data.length ? <Text variant="small" tone="gray">{t("admSupC.doc.noHits")}</Text> : null}
    </View>
  );
}
