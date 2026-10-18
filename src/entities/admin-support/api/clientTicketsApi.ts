import { http } from "@/shared/api";
import { asDict, listFrom } from "@/shared/lib/json";
import type { SupportTicket } from "../model/types";
import { normTicket } from "./normTicket";

const PAGE = 100;
const MAX_PAGES = 4;

// The queue endpoint has no client filter, so a client's tickets are collected page by page (newest first,
// all statuses) and filtered here — enough for the client card; the operator sees the same list the queue shows.
export async function listClientTickets(clientUserId: string): Promise<SupportTicket[]> {
  const found: SupportTicket[] = [];
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const raw = await http(`/call-center/support/tickets?limit=${PAGE}&offset=${page * PAGE}`);
    const items = listFrom(raw, "items", "data", "tickets").map(normTicket);
    found.push(...items.filter((tk) => tk.clientUserId === clientUserId));
    if (asDict(raw).has_more !== true || !items.length) break;
  }
  return found;
}
