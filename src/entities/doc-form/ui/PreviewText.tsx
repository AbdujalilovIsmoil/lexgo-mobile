import { Fragment } from "react";
import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Text } from "@/shared/ui";

const SPLIT = /(\[[^\]\n]+\])/g;
const IS_BLANK = /^\[[^\]\n]+\]$/;

// The server's filled-in text; spots still empty arrive as "[label]" and are
// highlighted so the client sees what is missing.
export function PreviewText({ text }: { text: string }) {
  const c = useColors();
  return (
    <View style={[s.box, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
      <Text variant="small" selectable>
        {text.split(SPLIT).map((part, i) =>
          IS_BLANK.test(part) ? <Text key={i} variant="small" weight="semibold" style={{ color: c.warn, backgroundColor: c.warnBg }}>{part}</Text> : <Fragment key={i}>{part}</Fragment>,
        )}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({ box: { borderWidth: 1, borderRadius: 16, padding: 14 } });
