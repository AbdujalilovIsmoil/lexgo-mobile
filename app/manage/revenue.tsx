import { AdminGate } from "@/entities/access";
import RevenuePage from "@/pages/admin-revenue/RevenuePage";

export default function Screen() {
  return (
    <AdminGate id="dash">
      <RevenuePage />
    </AdminGate>
  );
}
