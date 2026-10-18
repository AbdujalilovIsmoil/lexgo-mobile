import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/ui";
import type { FieldError } from "../lib/validate";
import type { DocAnswers, DocSection } from "../model/types";
import { FieldInput } from "./FieldInput";

type Props = { section: DocSection; answers: DocAnswers; errorOf: (key: string) => FieldError | ""; onChange: (key: string, value: string) => void };

// All fields of one section in the backend's order.
export function SectionForm({ section, answers, errorOf, onChange }: Props) {
  return (
    <View style={s.col}>
      {section.title ? <Text variant="h3">{section.title}</Text> : null}
      {section.fields.map((f) => (
        <FieldInput key={f.key} field={f} value={answers[f.key] ?? ""} error={errorOf(f.key)} onChange={(v) => onChange(f.key, v)} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 14 } });
