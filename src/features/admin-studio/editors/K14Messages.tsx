import { useState } from "react";
import { View } from "react-native";
import { Chip, Input, Text } from "@/shared/ui";
import { ChipBar } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { Block } from "../form/Block";
import type { Errors } from "../form/types";
import { rec, str } from "../form/values";

export const K14_LANGS = ["uz_latn", "uz_cyrl", "ru"];
export function msgOf(messages: unknown, lang: string): { title: string; body: string } {
  const m = rec(messages);
  const o = rec(m[lang] ?? m[lang.replace("_", "-")] ?? (lang === "uz_latn" ? m.uz : undefined));
  return { title: str(o.title ?? o.subject), body: str(o.body ?? o.text ?? o.message) };
}

type Props = { messages: unknown; variables: string[]; onChange: (next: Record<string, unknown>) => void; readOnly: boolean; errors: Errors; error?: string };

// Title and body of the notification in three languages; the chips insert {{variables}} at the end of the focused field.
export function K14Messages({ messages, variables, onChange, readOnly, errors, error }: Props) {
  const { t } = useT();
  const [lang, setLang] = useState("uz_latn");
  const [target, setTarget] = useState<"title" | "body">("body");
  const cur = msgOf(messages, lang);
  const all = Object.fromEntries(K14_LANGS.map((l) => [l, msgOf(messages, l)]));
  const set = (p: Partial<typeof cur>) => onChange({ ...rec(messages), ...all, [lang]: { ...cur, ...p } });
  const done = K14_LANGS.filter((l) => msgOf(messages, l).title.trim() && msgOf(messages, l).body.trim()).length;
  return (
    <Block title={t("admStudioB.k14.messages")} hint={`${t("admStudioB.k14.messagesHint")} ${t("admStudioB.k14.progress", { n: done, total: 3 })}`} error={error}>
      <ChipBar options={K14_LANGS.map((l) => ({ value: l, label: t(`admStudioB.k14.lang.${l}`) }))} value={lang} onChange={setLang} />
      <Input label={t("admStudioB.k14.msgTitle")} value={cur.title} onChangeText={(v) => set({ title: v })} onFocus={() => setTarget("title")} editable={!readOnly} error={errors[`messages.${lang}.title`] ? t("admStudioB.err.required") : undefined} />
      <Input label={t("admStudioB.k14.msgBody")} value={cur.body} onChangeText={(v) => set({ body: v })} onFocus={() => setTarget("body")} editable={!readOnly} multiline error={errors[`messages.${lang}.body`] ? t("admStudioB.err.required") : undefined} style={{ minHeight: 110, textAlignVertical: "top" }} />
      {readOnly ? null : variables.length ? (
        <View style={{ gap: 6 }}>
          <Text variant="caption" tone="gray">{t(target === "title" ? "admStudioB.k14.insertTitle" : "admStudioB.k14.insertBody")}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{variables.map((v) => <Chip key={v} label={`{{${v}}}`} onPress={() => set({ [target]: `${cur[target]}{{${v}}}` })} />)}</View>
        </View>
      ) : <Text variant="caption" tone="gray">{t("admStudioB.k14.insertNone")}</Text>}
    </Block>
  );
}
