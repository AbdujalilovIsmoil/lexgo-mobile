import { createContext, useContext } from "react";
import type { LeadScope } from "../api/scope";

const Ctx = createContext<LeadScope>("admin");

// The call-center tab wraps its board in <LeadScopeProvider value="cc">; the admin pipeline keeps the default.
export const LeadScopeProvider = Ctx.Provider;
export const useLeadScope = (): LeadScope => useContext(Ctx);
