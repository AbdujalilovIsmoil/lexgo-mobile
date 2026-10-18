import { z } from "zod";
import * as rules from "@/shared/form/rules";

// "Mark as paid": an optional note for the audit trail.
export const payoutNoteSchema = z.object({ note: rules.optText(1000) });
