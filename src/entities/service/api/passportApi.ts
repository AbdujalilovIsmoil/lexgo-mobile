import { http } from "@/shared/api";
import { asDict } from "@/shared/lib/json";
import { normService } from "./normalize";
import { normPassport } from "./normalizePassport";
import type { ServicePassport } from "../model/passportTypes";
import type { Service } from "../model/types";

export type PassportBundle = { service: Service; passport: ServicePassport };

// GET /services/{id}/passport: the full service card plus its passport.
export async function getPassport(serviceId: string, locale = "uz"): Promise<PassportBundle> {
  const d = asDict(await http(`/services/${encodeURIComponent(serviceId)}/passport`));
  return { service: normService(d.service, locale), passport: normPassport(d.passport) };
}
