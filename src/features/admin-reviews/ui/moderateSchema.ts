import { z } from "zod";
import * as rules from "@/shared/form/rules";

// Moderation: an optional note for the audit trail.
export const moderateSchema = z.object({ note: rules.optText(1000) });
