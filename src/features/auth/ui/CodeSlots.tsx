import { useRef } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { brand, radius, useColors } from "@/shared/theme";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { value: string; onChange: (v: string) => void; length?: number; error?: boolean; onComplete?: (code: string) => void; autoFocus?: boolean; disabled?: boolean };

// Six boxes over one hidden input (components/CodeSlots.tsx on the web).
export function CodeSlots({ value, onChange, length = 6, error, onComplete, autoFocus = true, disabled }: Props) {
  const c = useColors();
  const { t } = useT();
  const ref = useRef<TextInput>(null);
  const digits = value.slice(0, length).split("");
  const handle = (v: string) => {
    const clean = v.replace(/\D+/g, "").slice(0, length);
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
  };
  return (
    <Pressable onPress={() => ref.current?.focus()} accessibilityRole="none" style={s.wrap}>
      <TextInput
        ref={ref}
        accessibilityLabel={t("a11y.code")}
        value={value}
        onChangeText={handle}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        autoFocus={autoFocus}
        editable={!disabled}
        style={s.hidden}
        caretHidden
      />
      <View style={s.row}>
        {Array.from({ length }).map((_, i) => {
          const active = i === Math.min(digits.length, length - 1);
          return (
            <View key={i} style={[s.slot, { backgroundColor: c.surface, borderColor: error ? c.err : active ? brand.b600 : c.line, borderWidth: active || error ? 2 : 1.5 }]}>
              <Text variant="h3" center>
                {digits[i] ?? ""}
              </Text>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { alignSelf: "stretch" },
  hidden: { position: "absolute", opacity: 0, height: 1, width: 1 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  slot: { flex: 1, aspectRatio: 0.85, borderRadius: radius.r, alignItems: "center", justifyContent: "center" },
});
