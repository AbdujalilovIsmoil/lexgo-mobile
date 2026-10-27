import { View } from "react-native";
import { SwitchField } from "@/shared/ui/admin";
import { Segmented } from "@/shared/ui";
import { RA_PICK, RA_SWITCH, raFail, raOk, useRaControl } from "@/shared/remote-assist";
import { useT } from "@/shared/i18n";

type Props = { term: 6 | 12; upfront: boolean; onTerm: (t: 6 | 12) => void; onUpfront: (v: boolean) => void };

// 6 months / 1 year switch for the other tariffs; the year can be paid up front. On the remote-assistance map like the AI term bar.
export function OtherTermBar({ term, upfront, onTerm, onUpfront }: Props) {
  const { t } = useT();
  const termRa = useRaControl({
    id: "subscription.other.term",
    label: t("ra.el.otherTerm"),
    actions: RA_PICK,
    state: "selected",
    select: (v) => {
      if (v.trim() !== "6" && v.trim() !== "12") return raFail("option_not_found");
      onTerm(v.trim() === "12" ? 12 : 6);
      return raOk();
    },
  });
  const upRa = useRaControl(
    {
      id: "subscription.other.upfront",
      label: t("ra.el.otherUpfront"),
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
      <View {...termRa}><Segmented variant="solid" value={String(term)} onChange={(v) => onTerm(v === "12" ? 12 : 6)} options={[{ value: "6", label: t("cs.t6") }, { value: "12", label: t("cs.y1") }]} /></View>
      {term === 12 ? <View {...upRa}><SwitchField label={t("cs.upYear")} value={upfront} onChange={onUpfront} /></View> : null}
    </View>
  );
}
