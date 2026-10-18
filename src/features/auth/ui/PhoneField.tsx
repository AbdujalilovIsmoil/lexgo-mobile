import { PhoneInput } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { value: string; onChange: (v: string) => void; error?: string; autoFocus?: boolean };

// The sign-in / sign-up phone: country button + the number in that country's grouping.
export function PhoneField({ value, onChange, error, autoFocus }: Props) {
  const { t } = useT();
  return <PhoneInput label={t("auth.phone")} value={value} onChange={onChange} error={error} autoFocus={autoFocus} />;
}
