import { z } from "zod";
import * as rules from "@/shared/form/rules";

// The seller's reason for the supplemental payment; the options themselves come from Studio (TZ 11).
export const additionalSchema = z.object({ note: rules.optText(500) });
