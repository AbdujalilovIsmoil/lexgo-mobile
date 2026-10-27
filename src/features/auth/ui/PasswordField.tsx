import { useState } from "react";
import { Pressable } from "react-native";
import { Icon, Input } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { isBulkInsert, secretFrom } from "@/shared/lib/pasted";

type Props = { value: string; onChange: (v: string) => void; error?: string; hint?: string; label?: string; newPassword?: boolean; onSubmit?: () => void };

// A pasted password (or one put in by AutoFill) loses the line break, spaces and invisible marks it was copied with — "  Parol123\n" from
// a note or a chat used to be sent as typed and was refused. What is typed key by key is kept exactly.
export function PasswordField({ value, onChange, error, hint, label, newPassword, onSubmit }: Props) {
  const { t } = useT();
  const [show, setShow] = useState(false);
  return (
    <Input
      label={label ?? t("auth.password")}
      placeholder={t("auth.passwordPh")}
      value={value}
      onChangeText={(v) => onChange(isBulkInsert(value, v) ? secretFrom(v) : v)}
      secureTextEntry={!show}
      textContentType={newPassword ? "newPassword" : "password"}
      autoComplete={newPassword ? "new-password" : "password"}
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType={onSubmit ? "go" : "done"}
      onSubmitEditing={onSubmit}
      error={error}
      hint={hint}
      left={<Icon name="lock" size={18} tone="gray" />}
      right={
        <Pressable onPress={() => setShow((v) => !v)} hitSlop={10} accessibilityRole="button" accessibilityLabel={t(show ? "a11y.hide" : "a11y.show")}>
          <Icon name={show ? "eye-off" : "eye"} size={18} tone="gray" />
        </Pressable>
      }
    />
  );
}
