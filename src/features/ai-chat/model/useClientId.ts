import { useEffect, useState } from "react";
import { useSession } from "@/entities/session";
import { getClientId } from "@/shared/lib/clientId";

// Signed-in users chat under their own id; guests under a persistent anonymous one.
export function useClientId(): string | null {
  const session = useSession();
  const [guest, setGuest] = useState<string | null>(null);
  useEffect(() => {
    if (!session) void getClientId().then(setGuest);
  }, [session]);
  return session?.user.id || guest;
}
