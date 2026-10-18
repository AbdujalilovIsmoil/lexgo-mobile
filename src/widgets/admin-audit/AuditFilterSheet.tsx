import { useState } from "react";
import { NO_TEXT, type TextFilters } from "@/features/admin-audit";
import { UserPickerSheet } from "@/features/admin-user-picker";
import { Field, FormSheet } from "@/shared/ui/admin";
import { Button, Input } from "@/shared/ui";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";

// Text filters of the audit log: a user (picked by name / phone / id), an action and a target (type + id).
export function AuditFilterSheet({ visible, value, onClose, onApply }: { visible: boolean; value: TextFilters; onClose: () => void; onApply: (v: TextFilters) => void }) {
  const { t } = useT();
  const [d, setD] = useState<TextFilters>(value);
  const [picking, setPicking] = useState(false);
  useSheetReset(visible, () => setD(value));
  const set = (k: keyof TextFilters, v: string) => setD((x) => ({ ...x, [k]: v }));
  const apply = () => { onApply({ ...d, action: d.action.trim(), targetType: d.targetType.trim(), targetId: d.targetId.trim() }); onClose(); };
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("adm.filters")} submitLabel={t("adm.apply")} onSubmit={apply} secondary={{ label: t("adm.reset"), onPress: () => setD(NO_TEXT) }}>
      <Field label={t("admAudit.user")}>
        <Button title={d.userId ? d.userName || d.userId : t("admAudit.userPh")} icon="user" variant={d.userId ? "soft" : "line"} full onPress={() => setPicking(true)} />
        {d.userId ? <Button title={t("admAudit.clearUser")} variant="ghost" size="sm" onPress={() => setD((x) => ({ ...x, userId: "", userName: "" }))} /> : null}
      </Field>
      <Input label={t("admAudit.f.action")} value={d.action} onChangeText={(v) => set("action", v)} placeholder={t("admAudit.ph.action")} autoCapitalize="none" autoCorrect={false} />
      <Input label={t("admAudit.f.targetType")} value={d.targetType} onChangeText={(v) => set("targetType", v)} placeholder={t("admAudit.ph.targetType")} autoCapitalize="none" autoCorrect={false} />
      <Input label={t("admAudit.f.targetId")} value={d.targetId} onChangeText={(v) => set("targetId", v)} placeholder="UUID" autoCapitalize="none" autoCorrect={false} />
      <UserPickerSheet visible={picking} onClose={() => setPicking(false)} title={t("admAudit.user")} onPick={(u) => setD((x) => ({ ...x, userId: u.id, userName: u.name || u.phone }))} />
    </FormSheet>
  );
}
