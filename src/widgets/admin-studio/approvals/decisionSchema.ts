import { z } from "zod";
import * as rules from "@/shared/form/rules";

// The note under a decision: required when asking for changes or rejecting, optional otherwise.
export const decisionSchema = (needNote: boolean) => z.object({ note: needNote ? rules.text(1, 2000) : rules.optText(2000) });
