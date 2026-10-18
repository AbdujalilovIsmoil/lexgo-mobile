import { View } from "react-native";
import { OrgRow, type Organization } from "@/entities/organization";
import { FormSheet } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

type Props = { visible: boolean; orgs: Organization[]; currentId: string; onPick: (id: string) => void; onCreate: () => void; onClose: () => void };

// Which organization the owner is working on, plus the way to register another one.
export function OrgSwitchSheet({ visible, orgs, currentId, onPick, onCreate, onClose }: Props) {
  const { t } = useT();
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("og1.mine")} subtitle={t("og1.mineHint")} onSubmit={onCreate} submitLabel={t("og1.create")} snaps={[0.55, 0.9]}>
      <View style={{ gap: 10 }}>
        {orgs.map((o) => (
          <OrgRow key={o.id} org={o} current={o.id === currentId} onPress={() => { onPick(o.id); onClose(); }} />
        ))}
      </View>
    </FormSheet>
  );
}
