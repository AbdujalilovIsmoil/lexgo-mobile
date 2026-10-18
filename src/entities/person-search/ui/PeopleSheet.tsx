import type { ReactNode } from "react";
import { BottomSheet } from "@/shared/ui";
import type { Person } from "../model/usePeople";
import { PeoplePicker } from "./PeoplePicker";

type Props = {
  visible: boolean; onClose: () => void; title: string; subtitle?: string; me: string; note?: ReactNode;
  onPick?: (p: Person) => void; // single pick: the sheet stays open, the caller closes it
  selected?: Person[]; onChange?: (list: Person[]) => void; // multi pick with a "Done · n" button
  busyId?: string;
  min?: number; // multi pick: "Done" stays off until this many are picked
};

// Find a person (name / phone / public id) and pick one or several. Works for every role (see usePeople). The body is
// PeoplePicker; the new-meeting sheet embeds the same body as its second page instead of opening this sheet.
export function PeopleSheet({ visible, onClose, title, subtitle, me, note, onPick, selected, onChange, busyId, min }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title} subtitle={subtitle} snaps={[0.8, 0.94]}>
      <PeoplePicker me={me} enabled={visible} note={note} onPick={onPick} busyId={busyId} selected={selected} onChange={onChange} onDone={onChange ? onClose : undefined} min={min} />
    </BottomSheet>
  );
}
