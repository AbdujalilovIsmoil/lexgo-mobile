import { z } from "zod";
import * as rules from "@/shared/form/rules";

// Service form: the price is whole so'm typed as digits (empty = catalogue price), the note is free text.
// The price corridor itself comes from the server and is checked next to this (priceIssue).
export const serviceSchema = z.object({
  price: z.string().regex(/^\d{0,12}$/, rules.m("digits")),
  note: z.string().max(2000, rules.m("max", 2000)),
  status: z.string().min(1, rules.m("pick")),
});
