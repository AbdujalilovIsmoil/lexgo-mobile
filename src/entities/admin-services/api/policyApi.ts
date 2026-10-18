import { http } from "@/shared/api";
import { asDict } from "@/shared/lib/json";

type Sections = Record<string, Record<string, unknown>>;
const sections = (d: unknown): Sections => Object.fromEntries(Object.entries(asDict(asDict(d).items ?? asDict(d).sections ?? d)).map(([k, v]) => [k, asDict(v)]));

// GET /platform/policies (public): every policy section as a raw dict.
export const getPolicies = async (): Promise<Sections> => sections(await http("/platform/policies"));
// GET /admin/platform/policies: same, always the latest version.
export const getAdminPolicies = async (): Promise<Sections> => sections(await http("/admin/platform/policies"));
// PUT /admin/platform/policies/{section}: replaces the whole section.
export const putAdminPolicy = async (section: string, data: Record<string, unknown>): Promise<void> => {
  await http(`/admin/platform/policies/${section}`, { method: "PUT", body: data });
};
