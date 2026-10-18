import { useState } from "react";
import { useAppForm } from "@/shared/form";
import { normPhone } from "@/shared/lib/phone";
import { REGISTER_ROLES } from "./registerRoles";
import { registerSchema } from "./authSchemas";

// Sign-up fields (react-hook-form + registerSchema) and the server's answer shown under the form.
export function useRegisterForm(referral = "", initialRole = "") {
  const form = useAppForm(registerSchema, {
    role: REGISTER_ROLES.find((r) => r === initialRole) ?? "client",
    firstName: "", lastName: "", middleName: "", region: "" as never, phone: "", password: "",
    code: referral.trim().toUpperCase().slice(0, 32), agreed: false,
  });
  const [serverError, setServerError] = useState("");
  // What the server is sent: trimmed names, the phone as +998XXXXXXXXX, the referral code as typed.
  const toInput = (v: ReturnType<typeof registerSchema.parse>) => ({ role: v.role, firstName: v.firstName, lastName: v.lastName, middleName: v.middleName, region: v.region, phone: normPhone(v.phone), password: v.password, referralCode: v.code });
  return { form, role: form.watch("role"), serverError, setServerError, toInput };
}
export type RegisterFormState = ReturnType<typeof useRegisterForm>;
