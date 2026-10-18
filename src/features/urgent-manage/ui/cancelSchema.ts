import { z } from "zod";
import * as rules from "@/shared/form/rules";

// Cancel on the client's behalf: the reason is shown to the client, so it is required.
export const cancelSchema = z.object({ reason: rules.text(3, 500) });
