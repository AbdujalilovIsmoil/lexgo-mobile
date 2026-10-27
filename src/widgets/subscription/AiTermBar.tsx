import { View } from "react-native";
import { AI_TERMS, type Term } from "@/entities/plan";
import { SwitchField } from "@/shared/ui/admin";
import { Segmented, Text } from "@/shared/ui";
import { RA_PICK, RA_SWITCH, raFail, raOk, useRaControl } from "@/shared/remote-assist";
import { useT } from "@/shared/i18n";

type Props = { term: Term; upfront: boolean; onTerm: (t: Term) => void; onUpfront: (v: boolean) => void };

// 1 / 6 / 12 month switch (the terms the backend sells) and, for a year, the pay-up-front switch. Both are on the remote-assistance
// map: the operator picks a term or flips the switch through the same setters a tap uses.
export function AiTermBar({ term, upfront, onTerm, onUpfront }: Props) {
  const { t } = useT();
  const opts = AI_TERMS.map((m) => ({ value: String(m), label: t(`cs.t${m}`) }));
  const termRa = useRaControl({
    id: "subscription.ai.term",
    label: t("ra.el.aiTerm"),
    actions: RA_PICK,
    state: "selected",
    select: (v) => {
      const m = AI_TERMS.find((x) => String(x) === v.trim());
      if (!m) return raFail("option_not_found");
      onTerm(m);
      return raOk();
    },
  });
  const upRa = useRaControl(
    {
      id: "subscription.ai.upfront",
      label: t("ra.el.upfront"),
      actions: RA_SWITCH,
      state: upfront ? "selected" : "unselected",
      toggle: (on) => {
        onUpfront(on ?? !upfront);
        return raOk();
      },
    },
    term === 12,
  );
  return (
    <View style={{ gap: 10 }}>
      <Text variant="caption" tone="gray">{t("cs.term")}</Text>
      <View {...termRa}><Segmented variant="solid" value={String(term)} onChange={(v) => onTerm(Number(v) as Term)} options={opts} /></View>
      {term === 12 ? <View {...upRa}><SwitchField label={t("ntd.upBackend")} value={upfront} onChange={onUpfront} /></View> : null}
    </View>
  );
}
