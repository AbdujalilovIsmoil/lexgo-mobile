import { useQuery } from "@tanstack/react-query";
import { getThread } from "../api/threadApi";
import { hrmKey } from "./keys";

// One colleague's conversation; refreshed by the realtime/polling hook (useLive) like every other HRM query.
export const useThread = (peerId: string) => useQuery({ queryKey: hrmKey("thread", peerId), queryFn: () => getThread(peerId), enabled: !!peerId });
