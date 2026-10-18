import { useState } from "react";
import { usePathname } from "expo-router";
import { ApiError } from "@/shared/api";
import { toast } from "@/shared/ui";
import { useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { useSession } from "@/entities/session";
import { contactBlocked, useCreateTicket } from "@/entities/support";
import { problemSchema } from "./problemSchema";

export const KINDS = ["technical", "payment", "account", "document", "general"] as const;

// State and submit of the "report a problem" form: one support ticket (POST /support/tickets) tagged with the screen it came from.
export function useReportProblem(onDone: () => void) {
  const { t } = useT();
  const path = usePathname();
  const role = useSession()?.user.backendRole ?? "client";
  const create = useCreateTicket();
  const f = useAppForm(problemSchema, { message: "" });
  const [kind, setKind] = useState<(typeof KINDS)[number]>("technical");
  const [urgent, setUrgent] = useState(false);
  const err = create.error;
  const error = err ? contactBlocked(err) || (err instanceof ApiError && err.detail ? err.detail : t("rp.failed")) : "";
  const submit = f.handleSubmit((v) =>
    create.mutate({ message: v.message, category: kind, urgent, topicPicked: true, turns: [], aiSessionId: "", role, path }, {
      onSuccess: (tk) => { toast(tk.workId ? t("rp.sent", { id: tk.workId }) : t("rp.sentPlain"), "ok"); f.reset({ message: "" }); setUrgent(false); onDone(); },
    }));
  return { form: f, kind, setKind, urgent, setUrgent, error, submit, pending: create.isPending };
}
