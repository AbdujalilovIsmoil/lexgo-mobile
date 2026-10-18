import { View } from "react-native";
import { Button, Text } from "@/shared/ui";
import type { Dict } from "@/shared/lib/json";
import { useT } from "@/shared/i18n";
import { Block } from "../form/Block";
import { SchemaFields } from "../form/SchemaFields";
import { TagsField } from "../form/TagsField";
import type { EditorEntry, EditorProps, Errors } from "../form/types";
import { slugify, str, strList } from "../form/values";
import { K14_LANGS, K14Messages, msgOf } from "./K14Messages";

const HANDLED = ["messages", "variables"];
const VAR_RE = /\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g;
const usedVars = (messages: unknown): string[] => [...new Set(K14_LANGS.flatMap((l) => [...`${msgOf(messages, l).title} ${msgOf(messages, l).body}`.matchAll(VAR_RE)].map((m) => m[1])))];

function validateK14(payload: Dict): Errors {
  const out: Errors = {};
  if (!strList(payload.channels).length) out.channels = "@minOne";
  K14_LANGS.forEach((l) => {
    if (!msgOf(payload.messages, l).title.trim()) out[`messages.${l}.title`] = "@required";
    if (!msgOf(payload.messages, l).body.trim()) out[`messages.${l}.body`] = "@required";
  });
  return out;
}

// K14 notification template: schema fields (event, channels, recipients) + variables + 3-language text.
function K14Editor({ ctor, payload, onChange, errors, readOnly }: EditorProps) {
  const { t } = useT();
  const vars = strList(payload.variables);
  const missing = usedVars(payload.messages).filter((v) => !vars.includes(v));
  const set = (k: string, v: unknown) => onChange({ ...payload, [k]: v });
  return (
    <View style={{ gap: 14 }}>
      <SchemaFields ctor={ctor} payload={payload} onChange={onChange} errors={errors} readOnly={readOnly} exclude={HANDLED} />
      <Block title={t("admStudioB.k14.variables")} hint={t("admStudioB.k14.variablesHint")} count={vars.length}>
        <TagsField label="" value={vars} onChange={(v) => set("variables", v)} readOnly={readOnly} placeholder={t("admStudioB.k14.variablesPh")} normalize={slugify} mono />
        {missing.length && !readOnly ? (
          <View style={{ gap: 6 }}>
            <Text variant="caption" tone="warn">{t("admStudioB.k14.missingVars")} {missing.map((v) => `{{${v}}}`).join(", ")}</Text>
            <Button title={t("admStudioB.k14.addMissing")} icon="plus" variant="soft" size="sm" onPress={() => set("variables", [...vars, ...missing])} />
          </View>
        ) : null}
      </Block>
      <K14Messages messages={payload.messages} variables={vars} onChange={(m) => set("messages", m)} readOnly={readOnly} errors={errors} error={str(errors.messages)} />
    </View>
  );
}

export const K14: EditorEntry = {
  Editor: K14Editor,
  validate: validateK14,
  emptyPayload: () => ({ channels: ["in_app"], audience_roles: ["client"], variables: [], messages: { uz_latn: { title: "", body: "" }, uz_cyrl: { title: "", body: "" }, ru: { title: "", body: "" } } }),
  handled: HANDLED,
};
