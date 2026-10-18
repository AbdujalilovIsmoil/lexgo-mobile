import { z } from "zod";
import * as rules from "@/shared/form/rules";

// Task sheet: an optional new status (a plain choice) and an optional comment.
export const taskActSchema = z.object({ status: z.string(), comment: rules.optText(2000) });
