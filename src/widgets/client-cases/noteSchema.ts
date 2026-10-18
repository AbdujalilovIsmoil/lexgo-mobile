import { z } from "zod";
import * as rules from "@/shared/form/rules";

// Optional note sent along with an order status move.
export const noteSchema = z.object({ note: rules.optText(300) });
