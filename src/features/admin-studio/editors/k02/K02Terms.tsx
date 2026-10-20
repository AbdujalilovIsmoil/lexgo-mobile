import { useState } from "react";
import { View } from "react-native";
import { Button, Chip, Text } from "@/shared/ui";
import { studioError, suggestDiscoveryTerms } from "@/entities/admin-studio";
import { useMutation } from "@tanstack/react-query";
import type { Dict } from "@/shared/lib/json";
import { useT } from "@/shared/i18n";
import { Block } from "../../form/Block";
import { TagsField } from "../../form/TagsField";
import type { Errors } from "../../form/types";
import { str, strList } from "../../form/values";

type Props = { payload: Dict; onChange: (p: Dict) => void; errors: Errors; readOnly: boolean };

// Search terms: typed by hand, or suggested by the AI from the service's title, description and the rest of the form. The
// suggestions are only shown as chips: nothing is saved until you pick some and add them; a failure shows the server's reason and
// a retry, never made-up local suggestions.
export function K02Terms({ payload, onChange, errors, readOnly }: Props) {
  const { t } = useT();
  const terms = strList(payload.discovery_terms);
  const [picked, setPicked] = useState<string[]>([]);
  const ready = !!str(payload.title).trim() && !!str(payload.description).trim();
  const ask = useMutation({
    mutationFn: () => suggestDiscoveryTerms({
      title: str(payload.title), description: str(payload.description), client_value: str(payload.client_value), category_id: str(payload.category_id),
      usage_steps: strList(payload.usage_steps), inline_rules: payload.inline_rules ?? [], inline_guarantees: payload.inline_guarantees ?? [], discovery_terms: terms,
    }),
    onMutate: () => setPicked([]),
  });
  const fresh = (ask.data?.suggestions ?? []).filter((s) => !terms.some((x) => x.toLowerCase() === s.toLowerCase()));
  const add = () => { onChange({ ...payload, discovery_terms: [...terms, ...picked] }); setPicked([]); ask.reset(); };
  const failure = ask.error ? studioError(ask.error) : null;
  const message = failure ? (failure.code && t(`admStudioD.k02.errors.${failure.code}`) !== `admStudioD.k02.errors.${failure.code}` ? t(`admStudioD.k02.errors.${failure.code}`) : failure.message) : "";
  return (
    <Block title={t("admStudioD.k02.terms")} hint={t("admStudioD.k02.termsHint")} count={terms.length}>
      <TagsField label={t("admStudioD.k02.terms")} value={terms} onChange={(v) => onChange({ ...payload, discovery_terms: v })} readOnly={readOnly} error={errors.discovery_terms} />
      {readOnly ? null : (
        <>
          <Button title={ask.isPending ? t("admStudioD.k02.suggesting") : t(ask.isError ? "admStudioD.k02.retry" : "admStudioD.k02.suggest")} icon="zap" variant="soft" size="sm" loading={ask.isPending} disabled={!ready} onPress={() => ask.mutate()} style={{ alignSelf: "flex-start" }} />
          {!ready ? <Text variant="caption" tone="gray">{t("admStudioD.k02.needTitle")}</Text> : null}
          {message ? <Text variant="small" tone="err">{message}</Text> : null}
          {ask.isSuccess ? (
            fresh.length ? (
              <View style={{ gap: 10 }}>
                <Text variant="small" tone="gray">{t("admStudioD.k02.suggestions")}</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {fresh.map((s) => <Chip key={s} label={s} active={picked.includes(s)} onPress={() => setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]))} />)}
                </View>
                <Button title={`${t("admStudioD.k02.addSelected")}${picked.length ? ` (${picked.length})` : ""}`} icon="plus" size="sm" disabled={!picked.length} onPress={add} style={{ alignSelf: "flex-start" }} />
              </View>
            ) : <Text variant="caption" tone="gray">{t("admStudioD.k02.noneNew")}</Text>
          ) : null}
        </>
      )}
    </Block>
  );
}
