import type { Viewer } from "../types";

export const V: Record<string, Viewer> = {
  client: { signedIn: true, kind: "client" },
  seller: { signedIn: true, kind: "seller" },
};
