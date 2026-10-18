import { http } from "@/shared/api";
import { norm360 } from "./norm360";

// GET /admin/clients/{client_user_id}/360 (admin).
export const getClient360 = async (id: string) => norm360(await http(`/admin/clients/${encodeURIComponent(id)}/360`));
