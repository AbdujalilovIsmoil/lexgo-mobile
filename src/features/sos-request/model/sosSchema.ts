import { z } from "zod";
import * as rules from "@/shared/form/rules";

// An emergency must never be blocked by a form: the situation is optional (the category defaults to "other"), only its length is capped.
export const sosSchema = z.object({ desc: rules.optText(1000) });
