import { Stack } from "expo-router";
import { RoleGate } from "@/entities/access";

// Organization-owner area (/org/*): only advokat_tashkiloti / organization_owner accounts get in.
export default function OrgLayout() {
  return (
    <RoleGate roles={["orgOwner"]}>
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right", freezeOnBlur: true }} />
    </RoleGate>
  );
}
