import { AdminGate } from "@/entities/access";
import AdminMeetingsPage from "@/pages/admin-meetings/AdminMeetingsPage";

export default function Screen() {
  return (
    <AdminGate id="meetings">
      <AdminMeetingsPage />
    </AdminGate>
  );
}
