import { useState } from "react";
import { useRouter } from "expo-router";
import { callHref, channelsOf, groupsOf, isPriorPurchase, minutesOf, priceOf, useCatalog, useCreateUrgent, useUrgentFlash } from "@/entities/urgent";
import { useT } from "@/shared/i18n";
import { ApiError } from "@/shared/api";

export type Miss = "" | "dirs" | "need";
const MIN_NEED = 10;

// State + submit of the order form. The gate (402) is explained, never silently failed (TZ 42.2).
export function useOrderForm(startKey: string, fromUrgent = false) {
  const { t } = useT();
  const router = useRouter();
  const cat = useCatalog();
  const [key, setKey] = useState(startKey);
  const [pref, setPref] = useState("video");
  const [lawyers, setLawyers] = useState(3);
  const [dirs, setDirs] = useState<string[]>([]);
  const [need, setNeed] = useState("");
  const [miss, setMiss] = useState<Miss>("");
  const [gate, setGate] = useState("");
  const create = useCreateUrgent((e) => isPriorPurchase(e));

  const services = cat.data?.services ?? [];
  const service = services.find((s) => s.key === key);
  const channels = channelsOf(service);
  const channel = channels.includes(pref) ? pref : (channels[0] ?? "video");
  const isGroup = service?.key === "second_opinion_group";
  const count = Math.min(service?.lawyerCountMax || 7, Math.max(service?.lawyerCountMin || 2, lawyers));
  const group = groupsOf(cat.data).find((g) => g.items.includes(key));
  const price = priceOf(service, channel, isGroup ? count : 1);

  const submit = async () => {
    if (!service || create.isPending) return;
    if (!dirs.length) return setMiss("dirs");
    if (need.trim().length < MIN_NEED) return setMiss("need");
    setMiss("");
    try {
      const r = await create.mutateAsync({ serviceKind: service.key, channel, need: need.trim(), directions: dirs, lawyerCount: isGroup ? count : undefined });
      // Back on /urgent (the web page stays put too): the banner and the new row highlighted there; an immediate call rings on top.
      const call = r.immediate && r.roomId && r.callId;
      useUrgentFlash.getState().show(call ? null : r.immediate ? { ok: true, msg: r.message || t("ug2.noDuty") } : { ok: true, msg: t("ntd.ugSent"), next: t("ntd.ugSentNext") }, r.request.id);
      if (fromUrgent && router.canGoBack()) router.back(); else router.replace("/urgent");
      if (call) router.push(callHref(r.roomId, r.callId));
    } catch (e) {
      if (isPriorPurchase(e)) setGate((e instanceof ApiError && e.detail) || t("ug3.gateText"));
    }
  };

  return {
    cat, service, services, group, channels, channel, setPref, isGroup, count, setLawyers, dirs, setDirs, need, setNeed, miss, setMiss,
    price, minutes: minutesOf(service, channel), pick: (k: string) => { setKey(k); setGate(""); }, gate, closeGate: () => setGate(""), submit, pending: create.isPending, minNeed: MIN_NEED,
  };
}
export type OrderFormState = ReturnType<typeof useOrderForm>;
