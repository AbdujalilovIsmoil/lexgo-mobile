import { RoleGate } from "@/entities/access";
import MyDocumentsPage from "@/pages/my-documents/MyDocumentsPage";

// /documents — "Mening hujjatlarim" (TZ 15), separate from "Mening ishlarim".
export default function Screen() {
  return (
    <RoleGate roles={["any"]}>
      <MyDocumentsPage />
    </RoleGate>
  );
}
