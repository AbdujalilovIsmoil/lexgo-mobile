import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { OptionSection } from "../model/types";
import { OptionRow } from "./OptionRow";

type Props = { sections: OptionSection[]; ids: string[]; onToggle: (id: string) => void; disabled?: boolean };

// The server's option groups as checkbox lists. Every group is optional, so nothing is required or pre-selected.
export function OptionSections({ sections, ids, onToggle, disabled }: Props) {
  const { t } = useT();
  if (!sections.length) return null;
  return (
    <View style={s.col}>
      <Text variant="h4">{t("ntd.po.title")}</Text>
      <Text variant="caption" tone="gray">{t("ntd.po.hint")}</Text>
      {sections.map((sec) => (
        <View key={sec.id} style={s.group}>
          {sec.title ? <Text variant="small" weight="bold" tone="gray">{sec.title}</Text> : null}
          {sec.description ? <Text variant="caption" tone="gray2">{sec.description}</Text> : null}
          {sec.options.map((o) => <OptionRow key={o.id} option={o} on={ids.includes(o.id)} disabled={disabled} onPress={() => onToggle(o.id)} />)}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 10 }, group: { gap: 8 } });
