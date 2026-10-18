import { useRef, useState } from "react";
import { CONCURRENCY, sendNotification, type Outcome, type Summary } from "@/entities/admin-notify";
import { useErrorText } from "@/shared/ui";

export type Compose = { channel: string; category: string; title: string; body: string };
export type Recipient = { id: string; name: string };
export type Progress = { done: number; total: number };

// Sends the composed notification to many people (one request each, CONCURRENCY at a time, stoppable)
// or to a whole role (one request, the server fans out). Keeps every recipient's own outcome and why it failed.
export function useSender() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const stopRef = useRef(false);
  const why = useErrorText();

  const finish = (results: Outcome[], total: number, keep: Outcome[] = []) => {
    const stopped = stopRef.current && results.length < total;
    const ok = results.filter((r) => r.ok).length;
    setProgress(null);
    setSummary({ results: [...keep, ...results], stopped });
    return { ok, fail: results.length - ok, stopped, done: results.length, total };
  };

  async function toPeople(people: Recipient[], c: Compose, keep: Outcome[] = []) {
    stopRef.current = false;
    setSummary(null);
    setProgress({ done: 0, total: people.length });
    const results: Outcome[] = [];
    let next = 0;
    const worker = async () => {
      while (!stopRef.current) {
        const p = people[next++];
        if (!p) return;
        try {
          results.push({ id: p.id, name: p.name, ok: true, deliveries: (await sendNotification({ userId: p.id, ...c })).deliveries });
        } catch (e) {
          results.push({ id: p.id, name: p.name, ok: false, deliveries: [], reason: why(e) });
        }
        setProgress({ done: results.length, total: people.length });
      }
    };
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, people.length) }, worker));
    return finish(results, people.length, keep);
  }

  async function toRole(role: string, roleName: string, c: Compose) {
    stopRef.current = false;
    setSummary(null);
    setProgress({ done: 0, total: 1 });
    try {
      const r = await sendNotification({ audienceRole: role, ...c });
      return finish([{ id: role, name: roleName, ok: true, deliveries: r.deliveries }], 1);
    } catch (e) {
      return finish([{ id: role, name: roleName, ok: false, deliveries: [], reason: why(e) }], 1);
    }
  }

  return { progress, summary, toPeople, toRole, stop: () => { stopRef.current = true; } };
}
