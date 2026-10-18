import { z } from "zod";
import * as rules from "@/shared/form/rules";

// Optional note for the client when a document is sent.
export const notesSchema = z.object({ notes: rules.optText(1000) });
