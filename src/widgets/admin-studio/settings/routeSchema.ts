import { z } from "zod";
import * as rules from "@/shared/form/rules";

// Approval route: a constructor and a title are required (the steps are edited as a list and always keep one).
export const routeSchema = z.object({ code: rules.pick, title: rules.text(1, 120), status: z.string() });
