import { z } from "zod";
import { rules, useAppForm } from "@/shared/form";
import type { AssistOrder } from "@/entities/admin-support";
import { useReplaceQuote } from "./useReplaceQuote";

const schema = z.object({ amount: rules.optIntText(1), reason: rules.text(10, 1000) });

// Refund fields (react-hook-form + zod) and the replacement quote of the order the sheet is open for.
export function useAddPayForm(order: AssistOrder | null, replace: boolean) {
  const form = useAppForm(schema, { amount: "", reason: "" });
  return { form, rq: useReplaceQuote(order, replace && !!order) };
}
