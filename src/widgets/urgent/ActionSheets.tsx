import { CancelOwnSheet } from "@/features/urgent-request";
import { CancelSheet, ChatCompleteSheet, CompleteSheet, GroupSheet, StatusSheet, TransferSheet } from "@/features/urgent-manage";
import type { UrgentRequest } from "@/entities/urgent";
import type { Panel } from "./useRequestActions";

type Props = { req: UrgentRequest; panel: Panel; meId: string; onClose: () => void };

// The nested sheets behind the action buttons; each is a closed no-op until its panel is chosen.
export function ActionSheets({ req, panel, meId, onClose }: Props) {
  const p = { req, onClose };
  return (
    <>
      <GroupSheet {...p} visible={panel === "group"} />
      <CompleteSheet {...p} visible={panel === "complete"} />
      <TransferSheet {...p} visible={panel === "transfer"} />
      <CancelSheet {...p} visible={panel === "cancel"} />
      <StatusSheet {...p} meId={meId} visible={panel === "status"} />
      <ChatCompleteSheet {...p} visible={panel === "chatEnd"} />
      <CancelOwnSheet {...p} visible={panel === "cancelOwn"} />
    </>
  );
}
