import { useState } from "react";
import { PeopleSheet, type Person } from "@/entities/person-search";
import { useT } from "@/shared/i18n";

// Pick people to bring into the running meeting; the invites go out when the picker is closed.
export function InviteSheet({ visible, onClose, me, present, onSend }: { visible: boolean; onClose: () => void; me: string; present: string[]; onSend: (ids: string[]) => void }) {
  const { t } = useT();
  const [picked, setPicked] = useState<Person[]>([]);
  const close = () => {
    const ids = picked.map((u) => u.id).filter((id) => !present.includes(id));
    setPicked([]);
    onClose();
    if (ids.length) onSend(ids);
  };
  return <PeopleSheet visible={visible} onClose={close} title={t("admMeetB.invite")} me={me} selected={picked} onChange={setPicked} />;
}
