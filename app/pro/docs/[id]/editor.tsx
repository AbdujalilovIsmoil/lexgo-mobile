import { RoleGate } from "@/entities/access";
import DocEditorPage from "@/pages/pro-docs/DocEditorPage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <DocEditorPage />
    </RoleGate>
  );
}
