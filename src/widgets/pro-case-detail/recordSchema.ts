import { z } from "zod";
import * as rules from "@/shared/form/rules";

// A title-only document record of a case.
export const recordSchema = z.object({ title: rules.text(1, 200) });
