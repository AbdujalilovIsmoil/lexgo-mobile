import type { ReactNode } from "react";
import { View } from "react-native";
import type { StudioField } from "@/entities/admin-studio";
import type { Dict } from "@/shared/lib/json";
import { Block } from "./Block";
import type { Errors } from "./types";
import { errorsUnder, rec } from "./values";

type Props = { f: StudioField; label: string; value: unknown; onChange: (v: Dict) => void; errors: Errors; renderField: (p: StudioField, obj: Dict, set: (o: Dict) => void, errs: Errors) => ReactNode };

// An object drawn from the schema (`props`) as one titled block (e.g. K02 seller requirements).
export function NestedObject({ f, label, value, onChange, errors, renderField }: Props) {
  const obj = rec(value);
  return (
    <Block title={label} hint={f.help}>
      {(f.props ?? []).filter((p) => !p.managed).map((p) => <View key={p.key}>{renderField(p, obj, onChange, errorsUnder(errors, f.key))}</View>)}
    </Block>
  );
}
