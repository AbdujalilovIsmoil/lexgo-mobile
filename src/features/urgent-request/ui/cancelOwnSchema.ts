import { z } from "zod";
import * as rules from "@/shared/form/rules";

// The owner's own cancellation: the reason is optional (a default is supplied on submit).
export const cancelOwnSchema = z.object({ reason: rules.optText(500) });
