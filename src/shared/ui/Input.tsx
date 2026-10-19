import { useState, type ReactNode } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Text } from "./Text";
import { multiLineText, singleLineText } from "./inputText";

type Props = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  left?: ReactNode;
  right?: ReactNode;
};

// Rounded 14px field with a blue focus ring (:focus-visible outline on the web).
export function Input({ label, error, hint, left, right, style, ...rest }: Props) {
  const c = useColors();
  const [focused, setFocused] = useState(false);
  const border = error ? c.err : focused ? c.accent : c.line;
  return (
    <View style={s.wrap}>
      {label ? (
        <Text variant="small" tone="gray" style={s.label}>
          {label}
        </Text>
      ) : null}
      <View style={[s.field, { backgroundColor: c.surface, borderColor: border, borderWidth: focused || error ? 2 : 1.5 }]}>
        {left ? <View style={s.side}>{left}</View> : null}
        <TextInput
          accessibilityLabel={label ?? rest.placeholder}
          accessibilityHint={error ? undefined : hint}
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          placeholderTextColor={c.gray2}
          style={[s.input, rest.multiline ? multiLineText : singleLineText, { color: c.ink }, style]}
        />
        {right ? <View style={s.side}>{right}</View> : null}
      </View>
      {error ? (
        <Text variant="caption" tone="err" style={s.msg} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="gray2" style={s.msg}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 6 },
  label: { marginLeft: 4 },
  field: { flexDirection: "row", alignItems: "center", borderRadius: radius.r, minHeight: 52, paddingHorizontal: 14 },
  input: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 16, paddingVertical: 12 },
  side: { marginHorizontal: 4 },
  msg: { marginLeft: 4 },
});
