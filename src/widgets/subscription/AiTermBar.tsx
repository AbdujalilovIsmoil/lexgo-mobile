import { View } from "react-native";
import { AI_TERMS, type Term } from "@/entities/plan";
import { SwitchField } from "@/shared/ui/admin";
import { Segmented, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { term: Term; upfront: boolean; onTerm: (t: Term) => void; onUpfront: (v: boolean) => void };

// 1 / 6 / 12 month switch (the terms the backend sells) and, for a year, the pay-up-front switch.
export function AiTermBar({ term, upfront, onTerm, onUpfront }: Props) {
  const { t } = useT();
  const opts = AI_TERMS.map((m) => ({ value: String(m), label: t(`cs.t${m}`) }));
  return (
    <View style={{ gap: 10 }}>
      <Text variant="caption" tone="gray">{t("cs.term")}</Text>
      <Segmented variant="solid" value={String(term)} onChange={(v) => onTerm(Number(v) as Term)} options={opts} />
      {term === 12 ? <SwitchField label={t("ntd.upBackend")} value={upfront} onChange={onUpfront} /> : null}
    </View>
  );
}
