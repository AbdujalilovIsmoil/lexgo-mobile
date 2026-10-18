import { useQuery } from "@tanstack/react-query";
import { listClientTickets } from "../api/clientTicketsApi";
import { supKeys } from "./keys";

// Support tickets of one client (client card). A role without queue access gets a 403 → no retries.
export const useClientTickets = (clientUserId: string) =>
  useQuery({ queryKey: [...supKeys.all, "client-tickets", clientUserId], queryFn: () => listClientTickets(clientUserId), enabled: !!clientUserId, retry: false });
