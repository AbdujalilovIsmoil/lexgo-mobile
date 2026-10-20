import { View } from "react-native";
import { Button, Card } from "@/shared/ui";
import type { Dict } from "@/shared/lib/json";
import { useT } from "@/shared/i18n";
import { Block } from "../../form/Block";
import { RefField } from "../../form/RefField";
import { RowTools } from "../../form/RowTools";
import { TextField } from "../../form/TextField";
import type { Errors } from "../../form/types";
import { moveItem, recList, str, strList } from "../../form/values";
import { rowErr } from "./k02Logic";

type Props = { payload: Dict; onChange: (p: Dict) => void; errors: Errors; readOnly: boolean };
type Kind = { ids: string; inline: string; source: string; body: "body" | "description"; ns: "rules" | "guarantees" };
const RULES: Kind = { ids: "rule_ids", inline: "inline_rules", source: "/studio/reference/service-rules", body: "body", ns: "rules" };
const GUARANTEES: Kind = { ids: "guarantee_ids", inline: "inline_guarantees", source: "/studio/reference/client-guarantees", body: "description", ns: "guarantees" };

// Shared items picked from the library (searchable, paged) plus items written only for this service. The inline ones never reach the
// shared selector; their generated ids are kept as they are.
function Inline({ kind, payload, onChange, errors, readOnly }: Props & { kind: Kind }) {
  const { t } = useT();
  const k = (key: string) => t(`admStudioD.k02.${key}`);
  const ns = kind.ns;
  const rows = recList(payload[kind.inline]);
  const set = (next: Dict[]) => onChange({ ...payload, [kind.inline]: next });
  const patch = (i: number, p: Dict) => set(rows.map((r, j) => (j === i ? { ...r, ...p } : r)));
  const inlineTitle = ns === "rules" ? "inlineRules" : "inlineGuarantees";
  return (
    <>
      <Block title={k(ns)}>
        <RefField label={k(ns === "rules" ? "sharedRules" : "sharedGuarantees")} source={kind.source} multi value={strList(payload[kind.ids])} onChange={(v) => onChange({ ...payload, [kind.ids]: v })} readOnly={readOnly} />
      </Block>
      <Block title={k(inlineTitle)} hint={k(`${inlineTitle}Hint`)} count={rows.length}>
        {rows.map((r, i) => (
          <Card key={String(r.id ?? i)} style={{ gap: 10 }}>
            {readOnly ? null : <View style={{ alignSelf: "flex-end" }}><RowTools index={i} count={rows.length} onMove={(d) => set(moveItem(rows, i, d))} onRemove={() => set(rows.filter((_, j) => j !== i))} /></View>}
            <TextField label={k(ns === "rules" ? "ruleTitle" : "guaranteeTitle")} value={str(r.title)} onChange={(v) => patch(i, { title: v })} readOnly={readOnly} error={rowErr(errors, kind.inline, i, "title")} required />
            <TextField label={k(ns === "rules" ? "ruleBody" : "guaranteeBody")} value={str(r[kind.body])} onChange={(v) => patch(i, { [kind.body]: v })} readOnly={readOnly} error={rowErr(errors, kind.inline, i, kind.body)} multiline required />
          </Card>
        ))}
        {readOnly ? null : <Button title={k(ns === "rules" ? "addRule" : "addGuarantee")} icon="plus" variant="soft" size="sm" onPress={() => set([...rows, { title: "", [kind.body]: "" }])} />}
      </Block>
    </>
  );
}

export const K02Rules = (p: Props) => <Inline kind={RULES} {...p} />;
export const K02Guarantees = (p: Props) => <Inline kind={GUARANTEES} {...p} />;
