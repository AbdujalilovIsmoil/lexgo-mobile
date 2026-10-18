import { useMemo } from "react";
import { View } from "react-native";
import { FormInput, FormPhoneInput, useAppForm } from "@/shared/form";
import { normPhone, formatAnyPhone } from "@/shared/lib/phone";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { SwitchField } from "@/shared/ui/admin";
import { FieldCard, ProfileSheet } from "@/shared/ui/profile";
import { Chip } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { FamilyMember } from "@/entities/profile-extras";
import { familySchema } from "./familySchema";
import { useFamilyActions } from "./useFamilyActions";

const RELATIONS = ["spouse", "child", "parent", "sibling", "other"] as const;
type Props = { visible: boolean; member: FamilyMember | null; others: FamilyMember[]; onClose: () => void };

// Add or edit a family member. The backend validates nothing here, so familySchema does (name, number, no duplicate number).
export function FamilySheet({ visible, member, others, onClose }: Props) {
  const { t } = useT();
  const taken = useMemo(() => others.filter((m) => m.id !== member?.id).map((m) => normPhone(m.phone)), [others, member]);
  const schema = useMemo(() => familySchema(taken), [taken]);
  const f = useAppForm(schema, { name: "", phone: "+998 ", relation: "", shared: false });
  useSheetReset(visible, () => f.reset({ name: member?.name ?? "", phone: member ? formatAnyPhone(member.phone) : "+998 ", relation: member?.relation ?? "", shared: member?.sharedAccess ?? false }));
  const { save } = useFamilyActions(onClose);
  const relation = f.watch("relation");
  const submit = f.handleSubmit((v) => save.mutate({ id: member?.id, input: { name: v.name, phone: normPhone(v.phone), relation: v.relation, sharedAccess: v.shared } }));
  return (
    <ProfileSheet visible={visible} onClose={onClose} accent="rose" icon="users" title={t(member ? "py6.edit" : "py6.add")} subtitle={t("py6.note")} submitLabel={t("adm.save")} submitting={save.isPending} onSubmit={() => void submit()} snaps={[0.8, 0.94]}>
      <FieldCard>
        <FormInput control={f.control} name="name" label={t("py6.name")} autoCapitalize="words" placeholder={t("py6.namePh")} />
        <FormPhoneInput control={f.control} name="phone" label={t("py6.phone")} />
      </FieldCard>
      <FieldCard>
        <FormInput control={f.control} name="relation" label={t("py6.relation")} placeholder={t("py6.relationPh")} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{RELATIONS.map((r) => <Chip key={r} label={t(`py6.rel.${r}`)} active={relation === t(`py6.rel.${r}`)} onPress={() => f.setValue("relation", t(`py6.rel.${r}`), { shouldValidate: true })} />)}</View>
      </FieldCard>
      <FieldCard><SwitchField label={t("py6.share")} hint={t("py6.shareHint")} value={f.watch("shared")} onChange={(v) => f.setValue("shared", v)} /></FieldCard>
    </ProfileSheet>
  );
}
