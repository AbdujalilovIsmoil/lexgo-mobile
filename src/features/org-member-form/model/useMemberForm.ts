import { useMemo, useState } from "react";
import { useAppForm } from "@/shared/form";
import { useCandidates, useSaveMember, type Candidate, type OrgMember } from "@/entities/organization";
import { memberSchema } from "./memberSchema";

// Add a member (pick a seller from the directory + role in the organization) or, with `edit`, rename one.
export function useMemberForm(orgId: string, visible: boolean, edit: OrgMember | null, existing: Set<string>, onDone: () => void) {
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<Candidate | null>(null);
  const form = useAppForm(memberSchema, { title: "" });
  const list = useCandidates(visible && !edit);
  const save = useSaveMember(orgId, edit ? "og3.renamed" : "og3.added", onDone);
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const all = (list.data ?? []).filter((c) => !needle || c.name.toLowerCase().includes(needle));
    return all.sort((a, b) => Number(existing.has(a.userId)) - Number(existing.has(b.userId)) || b.rating - a.rating).slice(0, 40);
  }, [list.data, q, existing]);
  const reset = () => {
    setQ("");
    setPicked(null);
    form.reset({ title: edit?.title ?? "" });
  };
  const userId = edit?.userId ?? picked?.userId ?? "";
  return { q, setQ, picked, setPicked, form, list, rows, reset, userId, busy: save.isPending, submit: () => void form.handleSubmit((v) => userId && save.mutate({ userId, title: v.title }))() };
}
