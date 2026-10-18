import { useState } from "react";
import { View } from "react-native";
import { Field } from "@/shared/ui/admin";
import { Chip, Icon, Input, PressableScale } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// A list of texts: every item is a chip (tap to remove) and a field adds a new one.
export function ListField({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  const { t } = useT();
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft("");
  };
  return (
    <Field label={`${label} · ${value.length}`}>
      {value.length ? <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{value.map((v, i) => <Chip key={`${v}-${i}`} label={v} icon="x" onPress={() => onChange(value.filter((_, j) => j !== i))} />)}</View> : null}
      <Input value={draft} onChangeText={setDraft} onSubmitEditing={add} returnKeyType="done" placeholder={t("admPol.addItem")} autoCapitalize="none" autoCorrect={false} right={<PressableScale onPress={add} hitSlop={10}><Icon name="plus-circle" size={20} tone="accent" /></PressableScale>} />
    </Field>
  );
}
