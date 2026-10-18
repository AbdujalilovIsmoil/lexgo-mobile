import { useState } from "react";
import { useDebounced } from "@/shared/lib/useDebounced";
import type { DocReq } from "@/entities/doc-queue";

// Search, work-type chips and sort order for a list of requests (all applied on the device).
export function useDocFilter() {
  const [q, setQ] = useState("");
  const [flow, setFlow] = useState("all");
  const [newest, setNewest] = useState(true);
  const dq = useDebounced(q.trim().toLowerCase(), 250);
  const apply = (items: DocReq[]): DocReq[] => {
    const hit = (d: DocReq) => !dq || [d.title, d.clientName, d.serviceName, d.need, d.requestedType].join(" ").toLowerCase().includes(dq);
    const when = (d: DocReq) => Date.parse(d.updatedAt || d.createdAt) || 0;
    return items.filter((d) => hit(d) && (flow === "all" || d.flow === flow)).sort((a, b) => (newest ? when(b) - when(a) : when(a) - when(b)));
  };
  return { q, setQ, flow, setFlow, newest, toggleSort: () => setNewest((v) => !v), apply, key: `${dq}|${flow}|${newest}` };
}
export type DocFilter = ReturnType<typeof useDocFilter>;
