import { StyleSheet, View } from "react-native";
import { Chip } from "@/shared/ui";
import { useSupportLabels } from "@/entities/support";

type Props = { topics: string[]; value: string; onChange: (v: string) => void };

// Wrapping chips; tapping the picked one again clears it (the topic is then guessed from the text).
export function TopicChips({ topics, value, onChange }: Props) {
  const labels = useSupportLabels();
  return (
    <View style={s.wrap}>
      {topics.map((k) => (
        <Chip key={k} label={labels.category(k)} active={value === k} onPress={() => onChange(value === k ? "" : k)} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({ wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 } });
