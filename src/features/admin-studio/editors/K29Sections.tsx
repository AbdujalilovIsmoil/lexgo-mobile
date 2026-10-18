import { View } from "react-native";
import { Button, Card, Text } from "@/shared/ui";
import type { Dict } from "@/shared/lib/json";
import { useT } from "@/shared/i18n";
import { Block } from "../form/Block";
import { RowTools } from "../form/RowTools";
import { TextField } from "../form/TextField";
import type { Errors } from "../form/types";
import { errorsUnder, moveItem, recList, str } from "../form/values";
import { K29Option } from "./K29Option";
import { newOption, newSection, optionId } from "./k29Logic";

type Props = { sections: Dict[]; onChange: (s: Dict[]) => void; errors: Errors; readOnly: boolean };

// Sections of K29, each with its own options list. Every section is optional for the client and all controls are multi-select.
export function K29Sections({ sections, onChange, errors, readOnly }: Props) {
  const { t } = useT();
  const patch = (i: number, p: Dict) => onChange(sections.map((s, j) => (j === i ? { ...s, ...p } : s)));
  return (
    <Block title={t("ntd.studioV2.sections")} hint={t("ntd.studioV2.sectionsHint")} count={sections.length} error={errors.sections}>
      {sections.map((s, i) => {
        const opts = recList(s.options);
        const e = errorsUnder(errors, `sections.${i}`);
        const setOpts = (next: Dict[]) => patch(i, { options: next });
        return (
          <Card key={i} style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text variant="small" weight="bold" tone="gray">{t("ntd.studioV2.section", { n: i + 1 })}</Text>
              {readOnly ? null : <RowTools index={i} count={sections.length} onMove={(d) => onChange(moveItem(sections, i, d))} onRemove={() => onChange(sections.filter((_, j) => j !== i))} />}
            </View>
            <TextField label={t("ntd.studioV2.secTitle")} value={str(s.title)} onChange={(title) => patch(i, !str(s.id) || str(s.id) === optionId(str(s.title)) ? { title, id: optionId(title) } : { title })} readOnly={readOnly} error={e.title} required />
            <TextField label={t("ntd.studioV2.secId")} value={str(s.id)} onChange={(id) => patch(i, { id })} readOnly={readOnly} error={e.id} mono required />
            <TextField label={t("ntd.studioV2.optDesc")} value={str(s.description)} onChange={(description) => patch(i, { description })} readOnly={readOnly} multiline />
            {opts.map((o, j) => <K29Option key={j} o={o} i={j} count={opts.length} errors={errorsUnder(e, `options.${j}`)} readOnly={readOnly} onPatch={(p) => setOpts(opts.map((x, k) => (k === j ? { ...x, ...p } : x)))} onMove={(d) => setOpts(moveItem(opts, j, d))} onRemove={() => setOpts(opts.filter((_, k) => k !== j))} />)}
            {readOnly ? null : <Button title={t("ntd.studioV2.addOption")} icon="plus" variant="soft" size="sm" onPress={() => setOpts([...opts, newOption(opts.length + 1)])} />}
          </Card>
        );
      })}
      {readOnly ? null : <Button title={t("ntd.studioV2.addSection")} icon="plus" variant="soft" size="sm" onPress={() => onChange([...sections, newSection(sections.length + 1)])} />}
    </Block>
  );
}
