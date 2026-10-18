import { View } from "react-native";
import { ChipBar, SearchBox } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

export type UserFilter = { q: string; role: string; status: string };
const ROLES = ["client", "yurist", "advokat", "advokat_tashkiloti", "call_center", "manager", "admin"];
const STATUSES = ["active", "blocked", "pending", "deleted"];

// Search by name / phone / LexGo ID, plus role and account-status chips (all applied by the backend).
export function UserFilters({ value, onChange }: { value: UserFilter; onChange: (v: UserFilter) => void }) {
  const { t } = useT();
  const roles = [{ value: "", label: t("adm.all") }, ...ROLES.map((r) => ({ value: r, label: t(`ag2.role.${r}`) }))];
  const states = [{ value: "", label: t("adm.all") }, ...STATUSES.map((s) => ({ value: s, label: t(`admSt.${s}`) === `admSt.${s}` ? s : t(`admSt.${s}`) }))];
  return (
    <View style={{ gap: 8, marginHorizontal: -16, marginBottom: 10 }}>
      <SearchBox value={value.q} onChangeText={(q) => onChange({ ...value, q })} placeholder={t("ag3.search")} />
      <ChipBar options={roles} value={value.role} onChange={(role) => onChange({ ...value, role })} />
      <ChipBar options={states} value={value.status} onChange={(status) => onChange({ ...value, status })} />
    </View>
  );
}
