import { z } from "zod";
import * as rules from "@/shared/form/rules";

// The written part of a request to the duty advocate: an optional title, what is needed (the one required field), an optional note.
export const dutySchema = z.object({ title: rules.optText(120), need: rules.text(10, 5000), extra: rules.optText(2000) });
