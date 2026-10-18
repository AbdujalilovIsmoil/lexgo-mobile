import { z } from "zod";
import * as rules from "@/shared/form/rules";

// The name of a document the client adds to a case: a real title, not a stray letter.
export const docSchema = z.object({ title: rules.text(2, 200) });
