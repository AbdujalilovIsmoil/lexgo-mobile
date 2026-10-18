import { z } from "zod";
import * as rules from "@/shared/form/rules";

// A saved card: only the last four digits and the expiry are ever asked for (never the full number); the expiry must not be past.
export const methodSchema = z.object({ last4: rules.last4, exp: rules.cardExpiry });
