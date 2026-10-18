import { z } from "zod";
import * as rules from "@/shared/form/rules";

export const MAX_MINUTES = 120;
// Extra paid minutes: a whole number from 1 to 120.
export const extendSchema = z.object({ min: rules.intText(1, MAX_MINUTES) });
// Transfer: an advocate must be chosen, the reason is optional.
export const transferSchema = z.object({ lawyerId: rules.pick, reason: rules.optText(300) });
