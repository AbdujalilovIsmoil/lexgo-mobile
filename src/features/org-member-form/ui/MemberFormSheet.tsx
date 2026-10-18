import { View } from "react-native";
import { FormInput } from "@/shared/form";
import { ErrorView, Input, Skeleton, Icon, Text } from "@/shared/ui";
import { FormSheet } from "@/shared/ui/admin";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import type { OrgMember } from "@/entities/organization";
import { useMemberForm } from "../model/useMemberForm";
import { CandidateRow } from "./CandidateRow";

type Props = { visible: boolean; orgId: string; edit?: OrgMember | null; existing: Set<string>; onClose: () => void };

// Add a member from the seller directory, or (edit) change the member's role in the organization.
export function MemberFormSheet({ visible, orgId, edit = null, existing, onClose }: Props) {
  const { t } = useT();
  const f = useMemberForm(orgId, visible, edit, existing, onClose);
  useSheetReset(visible, f.reset);
  const picking = !edit;
  return (
    <FormSheet visible={visible} onClose={onClose} title={edit ? edit.name : t("og3.add")} subtitle={edit ? t("og3.editHint") : t("og3.addHint")} onSubmit={f.submit} submitLabel={edit ? t("adm.save") : t("og3.addSubmit")} submitting={f.busy} disabled={!f.userId}>
      {picking ? (
        <>
          <Input value={f.q} onChangeText={f.setQ} placeholder={t("og3.search")} autoCapitalize="none" autoCorrect={false} left={<Icon name="search" size={18} tone="gray" />} />
          {f.list.isLoading ? <Skeleton height={60} round={16} /> : f.list.isError ? <ErrorView error={f.list.error} onRetry={() => void f.list.refetch()} compact /> : (
            <View style={{ gap: 8 }}>
              {f.rows.map((c) => <CandidateRow key={c.userId} c={c} on={f.picked?.userId === c.userId} member={existing.has(c.userId)} onPress={() => f.setPicked(c)} />)}
            </View>
          )}
          {f.list.isSuccess && !f.rows.length ? <Text variant="small" tone="gray" center>{t("adm.noData")}</Text> : null}
        </>
      ) : null}
      <FormInput control={f.form.control} name="title" label={t("og3.role")} placeholder={t("og3.rolePh")} maxLength={80} hint={t("og3.roleHint")} />
    </FormSheet>
  );
}
