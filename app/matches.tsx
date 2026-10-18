import { RoleGate } from "@/entities/access";
import { MatchesPage } from "@/pages/matches/MatchesPage";

// "Siz uchun mos advokat va yuristlar" — a client-only screen (GET /matching/me).
export default function Screen() {
  return (
    <RoleGate roles={["client"]}>
      <MatchesPage />
    </RoleGate>
  );
}
