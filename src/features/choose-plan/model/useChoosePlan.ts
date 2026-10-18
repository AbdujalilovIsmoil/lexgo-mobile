import { useState } from "react";
import { useRouter } from "expo-router";
import type { BillingPeriod, Plan } from "@/entities/plan";
import { useIsAuthed } from "@/entities/session";

// The plan the user picked (with the period chosen on the page). Guests are sent to sign in; users get the checkout sheet.
export function useChoosePlan() {
  const router = useRouter();
  const authed = useIsAuthed();
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [picked, setPicked] = useState<Plan | null>(null);
  const [details, setDetails] = useState<Plan | null>(null);

  const choose = (plan: Plan, per?: BillingPeriod) => {
    if (!authed) return router.push("/auth/login");
    setDetails(null);
    if (per) setPeriod(per);
    setPicked(plan);
  };

  return { period, setPeriod, choose, authed, picked, closePicked: () => setPicked(null), details, openDetails: setDetails, closeDetails: () => setDetails(null) };
}
