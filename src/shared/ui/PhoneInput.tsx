import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { COUNTRIES, type Country } from "@/shared/lib/countries";
import { formatIntl, splitPhone } from "@/shared/lib/phone";
import { selectHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { Icon } from "./Icon";
import { Input } from "./Input";
import { PressableScale } from "./PressableScale";
import { SheetOption } from "./SheetOption";
import { BottomSheet, SheetScroll } from "./sheet";
import { Text } from "./Text";

type Props = { label?: string; value: string; onChange: (v: string) => void; error?: string; hint?: string; autoFocus?: boolean; placeholder?: string };

// A phone field with its country: a flag + "+998" button on the left opens the list of countries, the rest is the number typed in
// that country's grouping ("90 123 45 67"). The value it reports is the whole international number, "+998 90 123 45 67", so the
// forms and validation (rules.phone / normPhone) read the country from it. An empty field is "+998 " (the default country).
export function PhoneInput({ label, value, onChange, error, hint, autoFocus, placeholder }: Props) {
  const { t, locale } = useT();
  const c = useColors();
  const [open, setOpen] = useState(false);
  const { country, national } = splitPhone(value || "+998");
  const shown = formatIntl(country, national).slice(country.dial.length + 2);
  const pick = (next: Country) => { selectHaptic(); onChange(formatIntl(next, national)); setOpen(false); };
  const lang = locale === "ru" ? "ru" : locale === "en" ? "en" : "uz";
  return (
    <>
      <Input
        label={label}
        value={shown}
        onChangeText={(v) => onChange(formatIntl(country, v))}
        placeholder={placeholder ?? "90 123 45 67"}
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        autoComplete="tel"
        autoFocus={autoFocus}
        error={error}
        hint={hint}
        accessibilityLabel={label}
        left={
          <PressableScale onPress={() => setOpen(true)} haptic={false} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${country.name[lang]} +${country.dial}`} style={s.code}>
            <Text style={s.flag}>{country.flag}</Text>
            <Text variant="body" weight="bold">+{country.dial}</Text>
            <Icon name="chevron-down" size={15} color={c.gray} />
            <View style={[s.sep, { backgroundColor: c.line }]} />
          </PressableScale>
        }
      />
      <BottomSheet visible={open} onClose={() => setOpen(false)} title={t("shm.phone.country")} snaps={[0.7, 0.92]}>
        <SheetScroll>
          {COUNTRIES.map((k) => (
            <SheetOption key={k.code} on={k.code === country.code} label={`${k.flag}  ${k.name[lang]}  ·  +${k.dial}`} onPress={() => pick(k)} />
          ))}
        </SheetScroll>
      </BottomSheet>
    </>
  );
}

const s = StyleSheet.create({
  code: { flexDirection: "row", alignItems: "center", gap: 6, paddingRight: 6 },
  flag: { fontSize: 20 },
  sep: { width: 1, height: 22, marginLeft: 4 },
});
