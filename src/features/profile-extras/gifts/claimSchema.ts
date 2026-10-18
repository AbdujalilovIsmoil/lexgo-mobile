import { z } from "zod";
import * as rules from "@/shared/form/rules";

// Gift code: at least 4 characters (spaces are stripped while typing), at most 24.
export const claimSchema = z.object({ code: rules.text(4, 24) });
