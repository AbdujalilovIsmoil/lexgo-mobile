import { StyleSheet, View } from "react-native";
import { Button, Text } from "@/shared/ui";
import { Field } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

type Props = { value: number; min: number; max: number; onChange: (n: number) => void };

// Panel size of a group second opinion: min..max advocates, set by the catalog.
export function LawyerCount({ value, min, max, onChange }: Props) {
  const { t } = useT();
  return (
    <Field label={t("ug2.lawyerCount")} hint={t("ug2.lawyerRange", { min, max })}>
      <View style={s.row}>
        <Button title="−" variant="line" size="sm" disabled={value <= min} onPress={() => onChange(value - 1)} />
        <Text variant="h3" style={s.n}>{value}</Text>
        <Button title="+" variant="line" size="sm" disabled={value >= max} onPress={() => onChange(value + 1)} />
      </View>
    </Field>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 16 }, n: { minWidth: 28, textAlign: "center" } });
