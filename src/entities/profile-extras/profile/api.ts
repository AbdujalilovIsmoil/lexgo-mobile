import { http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";

export type ClientProfile = { name: string; phone: string; email: string; avatarUrl: string; planName: string; planStatus: string; renewsAt: string; autoRenew?: boolean };

function norm(v: unknown): ClientProfile {
  const d = asDict(v);
  const s = asDict(d.subscription);
  return { name: asStr(d.name), phone: asStr(d.phone), email: asStr(d.email), avatarUrl: asStr(d.avatar_url), planName: asStr(s.plan_name), planStatus: asStr(s.status), renewsAt: asStr(s.renews_at), autoRenew: [s.auto_renew, s.autopay, s.auto_pay].find((x) => typeof x === "boolean") as boolean | undefined };
}

export const getProfile = async (): Promise<ClientProfile> => norm(await http("/clients/me"));

// PUT /clients/me — only the fields given are sent (ClientProfileUpdate: name, email, avatar_url).
export const updateProfile = async (patch: { name?: string; email?: string; avatarUrl?: string }): Promise<ClientProfile> =>
  norm(await http("/clients/me", { method: "PUT", body: { name: patch.name, email: patch.email, avatar_url: patch.avatarUrl } }));
