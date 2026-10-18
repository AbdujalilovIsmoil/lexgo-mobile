import { useInsets } from "@/shared/lib/insets";
import { MeetingsBoard } from "./MeetingsBoard";

/** My meetings without props (the shape the old `widgets/admin-meetings` exported); new code can use MeetingsView. */
export function MyMeetings() {
  return <MeetingsBoard bottom={useInsets().bottom + 24} />;
}
