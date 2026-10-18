import { useState } from "react";
import { createSosRequest, type SosCategory, type SosRequest } from "@/entities/sos";
import { useAppForm } from "@/shared/form";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { sosSchema } from "./sosSchema";

export type SosStage = "idle" | "connecting" | "connected" | "sent";

// State of the SOS screen: pick a category, describe, connect. Fail-soft like the web:
// when POST /sos fails the emergency still reads as "sent" and an operator calls back.
export function useSos() {
  const [cat, setCat] = useState<SosCategory | "">("");
  const form = useAppForm(sosSchema, { desc: "" });
  const [stage, setStage] = useState<SosStage>("idle");
  const [req, setReq] = useState<SosRequest | null>(null);
  const [busy, setBusy] = useState(false);

  const trigger = form.handleSubmit(async (v) => {
    if (busy) return;
    setBusy(true);
    setStage("connecting");
    try {
      const r = await createSosRequest({ category: cat || "other", description: v.desc });
      setReq(r);
      setStage(r.roomId ? "connected" : "sent");
      successHaptic();
    } catch {
      errorHaptic();
      setStage("sent");
    } finally {
      setBusy(false);
    }
  });

  return { cat, setCat, control: form.control, stage, req, busy, trigger, again: () => setStage("idle") };
}
