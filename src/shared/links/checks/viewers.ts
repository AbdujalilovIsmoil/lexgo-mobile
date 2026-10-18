import type { Viewer } from "../types";

const base: Viewer = { signedIn: true, kind: "client", orgOwner: false, callCenterLawyer: false };
export const V: Record<string, Viewer> = {
  client: base,
  seller: { ...base, kind: "seller" },
  org: { ...base, kind: "seller", orgOwner: true },
  cc: { ...base, kind: "callcenter" },
  staff: { ...base, kind: "staff" },
};
