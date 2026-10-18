import { z } from "zod";
import * as rules from "@/shared/form/rules";

// Name and e-mail of the client (PUT /clients/me): a real name, an e-mail only when one is given.
export const profileSchema = z.object({ name: rules.personName, email: rules.optEmail });
export type ProfileValues = z.infer<typeof profileSchema>;
