import type { ReactNode } from "react";
import { View } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { EmptyState } from "@/shared/ui";
import type { Access } from "../model/access";
import { useAccess } from "../model/useAccess";

export type GateRole = "client" | "seller" | "orgOwner" | "callCenter" | "callCenterLawyer" | "staff" | "any";

const test: Record<GateRole, (a: Access, role: string) => boolean> = {
  any: () => true,
  client: (a, r) => r === "client" && !a.seller,
  seller: (a) => a.seller,
  orgOwner: (a) => a.orgOwner,
  callCenter: (a) => a.callCenter || a.callCenterOperator,
  callCenterLawyer: (a) => a.callCenterLawyer,
  staff: (a) => a.staff,
};

type Props = { roles: GateRole[]; perm?: string | string[]; children: ReactNode };

// Wraps the route of a role-specific area (/pro/*, /cc/*, /org/*): signed-out → login;
// a signed-in user outside the roles / without the permission gets a "no access" state
// (TZ 3.2: UI hiding is not security, the backend 403 stays final).
export function RoleGate({ roles, perm, children }: Props) {
  const authed = useIsAuthed();
  const a = useAccess();
  const router = useRouter();
  const c = useColors();
  const { t } = useT();
  if (!authed) return <Redirect href="/auth/login" />;
  const role = a.seller ? "seller" : "client";
  const ok = roles.some((r) => test[r](a, role)) && (perm === undefined || a.can(perm));
  if (ok) return <>{children}</>;
  return (
    <View style={{ flex: 1, backgroundColor: c.canvas, justifyContent: "center" }}>
      <EmptyState icon="lock" title={t("fnd1.gate.title")} text={t("fnd1.gate.text")} actionLabel={t("fnd1.gate.back")} onAction={() => (router.canGoBack() ? router.back() : router.replace("/"))} />
    </View>
  );
}
