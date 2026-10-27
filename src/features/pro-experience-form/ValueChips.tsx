import { StyleSheet, View } from "react-native";
import { strayValues } from "@/entities/pro-experience";
import { Pill, PressableScale } from "@/shared/ui";
import { Field, MultiChips } from "@/shared/ui/admin";
import { humanizeSlug } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

type Props = { label: string; options: { value: string; label: string }[]; value: string[]; onChange: (v: string[]) => void; error?: string };

// Stages / results: chips over the values the app offers. A value it does not offer (an older record's "court") is drawn as a removable
// chip, so it is never sent again unseen; the server's refusal of it shows underneath.
export function ValueChips({ label, options, value, onChange, error }: Props) {
  const { t } = useT();
  const stray = strayValues(value, options.map((o) => o.value));
  return (
    <Field label={label} error={error} hint={stray.length ? t("pxp.form.stray") : undefined}>
      <MultiChips options={options} value={value} onChange={onChange} />
      {stray.length ? (
        <View style={s.row}>
          {stray.map((x) => (
            <PressableScale key={x} onPress={() => onChange(value.filter((y) => y !== x))} accessibilityRole="button" accessibilityLabel={t("pxp.form.strayRemove", { v: x })}>
              <Pill label={humanizeSlug(x)} tone={error ? "err" : "warn"} icon="x" />
            </PressableScale>
          ))}
        </View>
      ) : null}
    </Field>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", flexWrap: "wrap", gap: 8 } });
