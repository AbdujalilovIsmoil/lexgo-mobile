import { View } from "react-native";
import { SwitchField } from "@/shared/ui/admin";
import { Segmented } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { term: 6 | 12; upfront: boolean; onTerm: (t: 6 | 12) => void; onUpfront: (v: boolean) => void };

// 6 months / 1 year switch for the other tariffs; the year can be paid up front.
export function OtherTermBar({ term, upfront, onTerm, onUpfront }: Props) {
  const { t } = useT();
  return (
    <View style={{ gap: 10 }}>
      <Segmented variant="solid" value={String(term)} onChange={(v) => onTerm(v === "12" ? 12 : 6)} options={[{ value: "6", label: t("cs.t6") }, { value: "12", label: t("cs.y1") }]} />
      {term === 12 ? <SwitchField label={t("cs.upYear")} value={upfront} onChange={onUpfront} /> : null}
    </View>
  );
}
