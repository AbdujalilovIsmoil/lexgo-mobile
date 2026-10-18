import { z } from "zod";
import * as rules from "@/shared/form/rules";

// The role (title) of a member inside the organization: optional, at most 80 characters.
export const memberSchema = z.object({ title: rules.optText(80) });
