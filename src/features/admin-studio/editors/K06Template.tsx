import { useState } from "react";
import { View } from "react-native";
import { Chip, Input, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { Block } from "../form/Block";

const PH_RE = /\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g;
export const placeholders = (text: string): string[] => [...new Set([...text.matchAll(PH_RE)].map((m) => m[1]))];

type Props = { text: string; names: string[]; onChange: (v: string) => void; readOnly: boolean; error?: string };

// Template text with {{field}} placeholders; the chips insert a field at the caret.
export function K06Template({ text, names, onChange, readOnly, error }: Props) {
  const { t } = useT();
  const [at, setAt] = useState(text.length);
  const unknown = placeholders(text).filter((n) => !names.includes(n));
  const insert = (n: string) => onChange(`${text.slice(0, at)}{{${n}}}${text.slice(at)}`);
  return (
    <Block title={t("admStudioB.k06.template")} hint={t("admStudioB.k06.templateHint")} error={error}>
      {names.length && !readOnly ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{names.map((n) => <Chip key={n} label={`{{${n}}}`} onPress={() => insert(n)} />)}</View>
      ) : !readOnly ? <Text variant="caption" tone="gray">{t("admStudioB.k06.insertNone")}</Text> : null}
      <Input value={text} onChangeText={onChange} onSelectionChange={(e) => setAt(e.nativeEvent.selection.start)} editable={!readOnly} multiline autoCapitalize="none" placeholder={t("admStudioB.k06.templatePh")} error={error ? t("admStudioB.err.required") : undefined} style={{ minHeight: 220, textAlignVertical: "top" }} />
      <Text variant="caption" tone="gray">{t("admStudioB.k06.chars", { n: text.length })} · {t("admStudioB.k06.vars", { n: placeholders(text).length })}</Text>
      {unknown.length ? <Text variant="caption" tone="warn">{t("admStudioB.k06.unknownVars")} {unknown.map((n) => `{{${n}}}`).join(", ")}</Text> : null}
    </Block>
  );
}
