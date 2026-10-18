import { AdminGate } from "@/entities/access";
import AdminTasksPage from "@/pages/admin-tasks/AdminTasksPage";

export default function Screen() {
  return (
    <AdminGate id="adminTasks">
      <AdminTasksPage />
    </AdminGate>
  );
}
