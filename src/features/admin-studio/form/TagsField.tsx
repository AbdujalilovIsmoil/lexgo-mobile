import { useState } from "react";
import { View } from "react-native";
import { useStudioText } from "@/entities/admin-studio";
import { Field } from "@/shared/ui/admin";
import { Chip, Icon, Input } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { label: string; value: string[]; onChange: (v: string[]) => void; readOnly?: boolean; error?: string; required?: boolean; placeholder?: string; mono?: boolean; normalize?: (s: string) => string };

// A list of short strings: chips (tap to remove) and an input that adds on "done" or a comma.
export function TagsField({ label, value, onChange, readOnly, error, required, placeholder, mono, normalize }: Props) {
  const { t } = useT();
  const { fieldErr } = useStudioText();
  const [draft, setDraft] = useState("");
  const commit = (raw: string) => {
    const parts = raw.split(/[,\n]/).map((s) => (normalize ? normalize(s) : s.trim())).filter(Boolean);
    if (parts.length) onChange([...new Set([...value, ...parts])]);
    setDraft("");
  };
  return (
    <Field label={required ? `${label} *` : label} error={error ? fieldErr(error) : undefined}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {value.map((v) => <Chip key={v} label={v} active icon={readOnly ? undefined : "x"} onPress={readOnly ? undefined : () => onChange(value.filter((x) => x !== v))} />)}
      </View>
      {readOnly ? null : (
        <Input
          value={draft}
          onChangeText={(v) => (v.endsWith(",") ? commit(v) : setDraft(v))}
          onSubmitEditing={() => commit(draft)}
          onBlur={() => commit(draft)}
          placeholder={placeholder ?? t("admStudioB.tagsPh")}
          autoCapitalize={mono ? "none" : "sentences"}
          autoCorrect={false}
          returnKeyType="done"
          right={draft ? <Icon name="plus-circle" size={20} tone="accent" /> : undefined}
        />
      )}
    </Field>
  );
}
