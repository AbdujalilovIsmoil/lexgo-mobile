import { useRaHost } from "@/features/remote-assist";

// The non-visual part, mounted once for a signed-in client: requests, the runtime contract and the running session's inputs.
export function RaHost() {
  useRaHost();
  return null;
}
