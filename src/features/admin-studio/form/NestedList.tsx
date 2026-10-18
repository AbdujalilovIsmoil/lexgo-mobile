import type { ReactNode } from "react";
import { View } from "react-native";
import { Button, Card, Text } from "@/shared/ui";
import type { StudioField } from "@/entities/admin-studio";
import type { Dict } from "@/shared/lib/json";
import { useT } from "@/shared/i18n";
import { Block } from "./Block";
import { defaultRow } from "./nested";
import { RowTools } from "./RowTools";
import type { Errors } from "./types";
import { errorFor, errorsUnder, moveItem, recList } from "./values";

type Props = { f: StudioField; label: string; value: unknown; onChange: (v: Dict[]) => void; errors: Errors; readOnly: boolean; renderField: (p: StudioField, row: Dict, set: (r: Dict) => void, errs: Errors) => ReactNode };

// A list of objects drawn from the schema (`item.props`): one card per row with move / remove, and an add button.
export function NestedList({ f, label, value, onChange, errors, readOnly, renderField }: Props) {
  const { t } = useT();
  const rows = recList(value);
  const props = (f.item?.props ?? []).filter((p) => !p.managed);
  return (
    <Block title={label} count={rows.length} hint={f.help} error={errors[f.key] ?? errorFor(errors, f.key)}>
      {rows.map((r, i) => (
        <Card key={i} style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text variant="small" weight="bold" tone="gray">#{i + 1}</Text>
            {readOnly ? null : <RowTools index={i} count={rows.length} onMove={(d) => onChange(moveItem(rows, i, d))} onRemove={() => onChange(rows.filter((_, j) => j !== i))} />}
          </View>
          {props.map((p) => <View key={p.key}>{renderField(p, r, (n) => onChange(rows.map((x, j) => (j === i ? n : x))), errorsUnder(errors, `${f.key}.${i}`))}</View>)}
        </Card>
      ))}
      {readOnly ? null : <Button title={t("ntd.studioV2.addRow")} icon="plus" variant="soft" size="sm" onPress={() => onChange([...rows, defaultRow(f.item?.props ?? [])])} />}
    </Block>
  );
}
