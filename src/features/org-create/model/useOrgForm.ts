import { useCreateOrg, type OrgInput } from "@/entities/organization";
import { useAppForm } from "@/shared/form";
import { normPhone } from "@/shared/lib/phone";
import { orgSchema } from "./orgSchema";

const EMPTY: OrgInput = { name: "", phone: "", inn: "", region: "", address: "" };

// Form state + validation of "new organization" (name 2-255 chars, phone optional but valid).
export function useOrgForm(onCreated: (id: string) => void) {
  const f = useAppForm(orgSchema, EMPTY);
  const create = useCreateOrg(onCreated);
  const submit = f.handleSubmit((v) => create.mutate({ ...v, phone: v.phone.trim() ? normPhone(v.phone) : "" }));
  return { f, submit: () => void submit(), reset: () => f.reset(EMPTY), busy: create.isPending };
}
