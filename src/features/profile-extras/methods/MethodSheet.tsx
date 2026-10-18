import { useState } from "react";
import { usePreventScreenCapture } from "expo-screen-capture";
import { View } from "react-native";
import { BRANDS, CardFace, normExpiry } from "@/entities/profile-extras";
import { SwitchField } from "@/shared/ui/admin";
import { FieldCard, ProfileSheet } from "@/shared/ui/profile";
import { FormInput, useAppForm } from "@/shared/form";
import { Chip, Text } from "@/shared/ui";
import { Notice } from "@/shared/ui/sel/Notice";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { methodSchema } from "./methodSchema";
import { useMethodActions } from "./useMethodActions";

// The sheet holds nothing but card-form fields, so the screen is protected while it is open (TZ 40).
function Guard() {
  usePreventScreenCapture();
  return null;
}

type Props = { visible: boolean; onClose: () => void; title?: string; note?: string; forceDefault?: boolean };

// Add a card: brand, the last 4 digits and the expiry — a full card number is never asked for.
// The auto-pay "bind card" window reuses it with its own title and note, and always saves the card as default.
export function MethodSheet({ visible, onClose, title, note, forceDefault }: Props) {
  const { t } = useT();
  const [brand, setBrand] = useState<string>("uzcard");
  const [def, setDef] = useState(false);
  const f = useAppForm(methodSchema, { last4: "", exp: "" });
  useSheetReset(visible, () => { setBrand("uzcard"); f.reset({ last4: "", exp: "" }); setDef(false); });
  const { add } = useMethodActions(onClose);
  const { last4, exp } = f.watch();
  const submit = f.handleSubmit((v) => add.mutate({ brand, last4: v.last4, expires: v.exp, isDefault: forceDefault || def }));
  return (
    <ProfileSheet visible={visible} onClose={onClose} plain title={title ?? t("py6.card.add")} submitLabel={t("adm.save")} submitting={add.isPending} onSubmit={() => void submit()} snaps={[0.84, 0.95]}>
      {visible ? <Guard /> : null}
      {note ? <Notice text={note} /> : null}
      <CardFace brand={brand} last4={last4} expires={exp} isDefault={forceDefault || def} />
      <View style={{ gap: 8 }}>
        <Text variant="small" tone="gray">{t("py6.card.brand")}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{BRANDS.map((b) => <Chip key={b} label={b.toUpperCase()} active={brand === b} onPress={() => setBrand(b)} />)}</View>
      </View>
      <FieldCard>
        <FormInput control={f.control} name="last4" label={t("py6.card.last4")} format={(v) => v.replace(/\D/g, "").slice(0, 4)} keyboardType="number-pad" maxLength={4} placeholder="1234" hint={t("py6.card.hint")} />
        <FormInput control={f.control} name="exp" label={t("py6.card.expires")} format={normExpiry} keyboardType="number-pad" maxLength={5} placeholder="MM/YY" />
      </FieldCard>
      {forceDefault ? null : <FieldCard><SwitchField label={t("py6.card.default")} value={def} onChange={setDef} /></FieldCard>}
      <Text variant="caption" tone="gray2">{t("py6.card.secure")}</Text>
    </ProfileSheet>
  );
}
