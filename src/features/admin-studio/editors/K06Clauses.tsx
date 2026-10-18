import { View } from "react-native";
import { Button, Card, Text } from "@/shared/ui";
import type { Dict } from "@/shared/lib/json";
import { useT } from "@/shared/i18n";
import { Block } from "../form/Block";
import { RowTools } from "../form/RowTools";
import { TextField } from "../form/TextField";
import type { Errors } from "../form/types";
import { moveItem, str } from "../form/values";

type Props = { clauses: Dict[]; onChange: (next: Dict[]) => void; readOnly: boolean; errors: Errors };

// The clause library of a document template: ready-made titled paragraphs.
export function K06Clauses({ clauses, onChange, readOnly, errors }: Props) {
  const { t } = useT();
  const patch = (i: number, p: Dict) => onChange(clauses.map((c, j) => (j === i ? { ...c, ...p } : c)));
  return (
    <Block title={t("admStudioB.k06.clauses")} hint={t("admStudioB.k06.clausesHint")} count={clauses.length}>
      {clauses.length === 0 ? <Text variant="small" tone="gray">{t("admStudioB.k06.clausesNone")}</Text> : null}
      {clauses.map((c, i) => (
        <Card key={i} style={{ gap: 10 }}>
          {readOnly ? null : <View style={{ alignSelf: "flex-end" }}><RowTools index={i} count={clauses.length} onMove={(d) => onChange(moveItem(clauses, i, d))} onRemove={() => onChange(clauses.filter((_, j) => j !== i))} /></View>}
          <TextField label={t("admStudioB.k06.clauseTitle")} value={str(c.title)} onChange={(v) => patch(i, { title: v })} readOnly={readOnly} error={errors[`clauses.${i}.title`]} placeholder={t("admStudioB.k06.clauseTitlePh")} />
          <TextField label={t("admStudioB.k06.clauseText")} value={str(c.text)} onChange={(v) => patch(i, { text: v })} readOnly={readOnly} error={errors[`clauses.${i}.text`]} multiline />
        </Card>
      ))}
      {readOnly ? null : <Button title={t("admStudioB.k06.addClause")} icon="plus" variant="soft" size="sm" onPress={() => onChange([...clauses, { title: "", text: "" }])} />}
    </Block>
  );
}
