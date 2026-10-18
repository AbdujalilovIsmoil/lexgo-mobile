import { z } from "zod";
import * as rules from "@/shared/form/rules";

// Studio access: a user, at least one role, and — when limited to some constructors — at least one of them.
export const grantSchema = z.object({
  userId: rules.pick, roles: z.array(z.string()).min(1, rules.m("pick")), scope: z.enum(["all", "some"]), codes: z.array(z.string()), active: z.boolean(),
}).superRefine((v, ctx) => {
  if (v.scope === "some" && !v.codes.length) ctx.addIssue({ code: "custom", path: ["codes"], message: rules.m("pick") });
});
