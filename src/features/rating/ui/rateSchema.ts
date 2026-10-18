import { z } from "zod";
import * as rules from "@/shared/form/rules";

// Rating of a work: 1–5 stars; comment and complaint (shown at 1–2 stars) are optional and sent as typed.
export const rateSchema = z.object({
  stars: z.number().min(1, rules.m("pick")),
  comment: z.string().max(500, rules.m("max", 500)),
  complaint: z.string().max(2000, rules.m("max", 2000)),
});
