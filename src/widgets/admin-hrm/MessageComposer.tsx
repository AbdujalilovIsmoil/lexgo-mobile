import { useState } from "react";
import { MessageForm, type Recipient } from "@/features/admin-hrm";
import { UserPickerSheet } from "@/features/admin-user-picker";
import { useT } from "@/shared/i18n";

type Stage = "form" | "pick" | "gap";
type Props = { visible: boolean; onClose: () => void; preset?: Recipient | null };

// New message flow: the form first; "recipient" swaps it for the people picker and back (one native sheet at a time).
export function MessageComposer({ visible, onClose, preset = null }: Props) {
  const { t } = useT();
  const [stage, setStage] = useState<Stage>("form");
  const [picked, setPicked] = useState<Recipient | null>(null);
  const swap = (next: Stage) => {
    setStage("gap");
    setTimeout(() => setStage(next), 320);
  };
  // A sheet reports "closed" after every hide animation; only a hide while it is the active stage is the user's.
  const closeForm = () => {
    if (stage !== "form") return;
    setPicked(null);
    onClose();
  };
  return (
    <>
      <MessageForm visible={visible && stage === "form"} onClose={closeForm} to={picked ?? preset} onPick={() => swap("pick")} />
      <UserPickerSheet
        visible={visible && stage === "pick"} onClose={() => stage === "pick" && swap("form")} title={t("admHrm.pickRecipient")}
        onPick={(u) => setPicked({ id: u.id, name: u.name || u.phone })}
      />
    </>
  );
}
