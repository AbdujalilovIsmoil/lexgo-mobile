import { useState } from "react";
import { registerSessionReset } from "@/shared/lib/sessionReset";
import { useT } from "@/shared/i18n";
import type { MyDoc } from "@/entities/my-document";

// "Your work went to the duty advocate — will you also fill it in yourself?" Asked once per
// request (the backend keeps prompt_required true for the whole hold), "no" just waits.
// The question is a drawer (CtorSheet): this hook says when to show it and with which words.
const asked = new Set<string>();
registerSessionReset(() => asked.clear());

export function useCtorPrompt(doc: MyDoc | undefined) {
  const { t } = useT();
  const [closed, setClosed] = useState("");
  const id = doc?.id ?? "";
  const ctor = doc?.ctor;
  const ask = !!id && !!ctor && ctor.available && ctor.promptRequired && !asked.has(id) && closed !== id;
  const close = () => { asked.add(id); setClosed(id); };
  return { visible: ask, close, title: ctor?.title || t("dm3.ctorTitle"), message: ctor?.message || t("dm3.ctorText") };
}
