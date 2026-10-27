import { useEffect, useRef, useState } from "react";
import { AppState, StyleSheet, TextInput, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { brand, radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { codeFrom } from "@/shared/lib/pasted";

type Props = { value: string; onChange: (v: string) => void; length?: number; error?: boolean; onComplete?: (code: string) => void; autoFocus?: boolean; disabled?: boolean };

// Whether the clipboard holds some text right now (asking does not read it, so iOS shows no "Allow Paste" prompt).
function useClipboardHasText(): boolean {
  const [has, setHas] = useState(false);
  useEffect(() => {
    const look = () => void Clipboard.hasStringAsync().then(setHas, () => setHas(false));
    look();
    const sub = AppState.addEventListener("change", (s) => s === "active" && look()); // back from the app the code was copied in
    return () => sub.remove();
  }, []);
  return has;
}

// Six boxes under one input (components/CodeSlots.tsx on the web). The input lies over the boxes, nearly transparent: a tap focuses it,
// a long press opens the system menu with Paste (its caret is not hidden: Android offers no Paste in an empty field without one). A hidden 1-point input could not be long-pressed on a phone (only a keyboard's Cmd+V
// reached it, so pasting worked in the simulator alone), and its length limit cut a pasted "Kod: 123 456" to "Kod: 1". Whatever comes in,
// the code is picked out of it; with text on the clipboard a Paste button fills the boxes in one tap.
export function CodeSlots({ value, onChange, length = 6, error, onComplete, autoFocus = true, disabled }: Props) {
  const c = useColors();
  const { t } = useT();
  const ref = useRef<TextInput>(null);
  const hasText = useClipboardHasText();
  const digits = value.slice(0, length).split("");
  const handle = (v: string) => {
    const code = codeFrom(v, length);
    onChange(code);
    if (code.length === length) onComplete?.(code);
  };
  const pasted = (text: string) => {
    const code = codeFrom(text, length);
    if (code) handle(code);
    else ref.current?.focus();
  };
  return (
    <View style={s.wrap}>
      <View>
        <View style={s.row} pointerEvents="none">
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
        <TextInput
          ref={ref}
          accessibilityLabel={t("a11y.code")}
          value={value}
          onChangeText={handle}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          autoFocus={autoFocus}
          editable={!disabled}
          selectionColor="transparent"
          style={[StyleSheet.absoluteFill, s.input]}
        />
      </View>
      {hasText && !disabled && value.length < length ? (
        Clipboard.isPasteButtonAvailable ? (
          <Clipboard.ClipboardPasteButton
            onPress={(d) => d.type === "text" && pasted(d.text)}
            acceptedContentTypes={["plain-text"]}
            displayMode="iconAndLabel"
            cornerStyle="capsule"
            backgroundColor={c.surface2}
            foregroundColor={c.accent}
            style={s.native}
          />
        ) : (
          <PressableScale onPress={() => void Clipboard.getStringAsync().then(pasted, () => undefined)} accessibilityRole="button" style={[s.paste, { backgroundColor: c.surface2 }]}>
            <Icon name="clipboard" size={15} tone="accent" />
            <Text variant="small" weight="bold" tone="accent">{t("auth.paste")}</Text>
          </PressableScale>
        )
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignSelf: "stretch", gap: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  slot: { flex: 1, aspectRatio: 0.85, borderRadius: radius.r, alignItems: "center", justifyContent: "center" },
  // Over the boxes, invisible to the eye but not to the touch system (iOS ignores touches on views below 1% opacity).
  input: { opacity: 0.02, color: "transparent", fontSize: 1 },
  native: { alignSelf: "center", height: 40, width: 140 },
  paste: { alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, height: 40, borderRadius: 20 },
});
