import { create } from "zustand";
import { ANALYTICS_DEFAULT_ON } from "@/shared/config/infra";
import { readJson, writeJson } from "@/shared/lib/storage";
import { scrubProps } from "./scrub";

export type AnalyticsName =
  | "screen_view" | "action_started" | "action_completed" | "action_failed" | "api_latency" | "ws_reconnect"
  | "call_quality" | "upload_size" | "funnel_step" | "deep_link_result" | "push_permission" | "local_alert"
  | "outbox_flush" | "network_change"
  | DocEventName;
// Ready legal documents (README §24): never an answer, a file name, a voice URL or a message — only the kind of thing.
export type DocEventName =
  | "document_catalog_opened" | "document_template_searched" | "document_template_opened" | "document_constructor_started" | "document_constructor_saved"
  | "document_preview_opened" | "document_generation_requested" | "document_clean_template_downloaded" | "document_lawyer_request_started"
  | "document_lawyer_request_submitted" | "document_completed_file_downloaded";
export type AnalyticsEvent = { t: number; name: AnalyticsName; props: Record<string, string | number | boolean> };
export type Transport = (batch: AnalyticsEvent[]) => void | Promise<void>;

const CAP = 200;
const buffer: AnalyticsEvent[] = [];
let transport: Transport | null = null;
let queue: AnalyticsEvent[] = [];
let timer: ReturnType<typeof setTimeout> | undefined;

// Opt-out switch + buffer size for the storage screen.
export const useAnalyticsStore = create<{ enabled: boolean; count: number }>(() => ({ enabled: ANALYTICS_DEFAULT_ON, count: 0 }));

function drain(): void {
  const batch = queue;
  queue = [];
  timer = undefined;
  if (transport && batch.length) void Promise.resolve(transport(batch)).catch(() => {});
}

/** Records one event. Props pass the PII scrubber; with no transport it only fills the ring buffer. */
export function track(name: AnalyticsName, props?: Record<string, unknown>): void {
  if (!useAnalyticsStore.getState().enabled) return;
  const ev: AnalyticsEvent = { t: Date.now(), name, props: scrubProps(props) };
  buffer.push(ev);
  if (buffer.length > CAP) buffer.shift();
  useAnalyticsStore.setState({ count: buffer.length });
  if (!transport) return;
  queue.push(ev);
  timer ??= setTimeout(drain, 5000);
}

/** Wires a sink (HTTP endpoint, vendor SDK). null removes it; events then stay in the ring buffer. */
export const setTransport = (t: Transport | null): void => void (transport = t);
const ENABLED_KEY = "lexgo_analytics_on";
export function setAnalyticsEnabled(enabled: boolean): void {
  useAnalyticsStore.setState({ enabled });
  void writeJson(ENABLED_KEY, enabled);
}
// Applies the user's saved choice (opt-out) at start.
export const loadAnalyticsEnabled = async (): Promise<void> => {
  const saved = await readJson<boolean>(ENABLED_KEY);
  if (typeof saved === "boolean") useAnalyticsStore.setState({ enabled: saved });
};
export const getEvents = (): readonly AnalyticsEvent[] => buffer;
export function clearEvents(): void {
  buffer.length = 0;
  queue = [];
  useAnalyticsStore.setState({ count: 0 });
}
