import { z } from "zod";
import * as rules from "@/shared/form/rules";

// User edit: a first name is required, the other name parts are optional; the status is a plain choice.
export const userEditSchema = z.object({ first: rules.text(1, 80), last: rules.optText(80), middle: rules.optText(80), status: z.string() });
