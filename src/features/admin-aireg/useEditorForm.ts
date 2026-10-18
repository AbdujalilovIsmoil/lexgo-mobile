import { useState } from "react";
import { latestVersion, type Reglament } from "@/entities/admin-aireg";
import { useAppForm } from "@/shared/form";
import { editorSchema } from "./editorSchema";
import { seedNew, type Form } from "./editorSeed";

export type Vals = Omit<Form, "base">;
const valsOf = (x: Form): Vals => ({ target: x.target, title: x.title, choice: x.choice, custom: x.custom, version: x.version, status: x.status, content: x.content });

// The editor's form: the typed values live in react-hook-form, the base reglament (what they were seeded from) beside them.
export function useEditorForm() {
  const [base, setBase] = useState<Reglament | null>(null);
  const current = base ? latestVersion(base) : "";
  const f = useAppForm(editorSchema(current), valsOf(seedNew("", "support")));
  /** Replace every value (and the base) with a seed. */
  const load = (x: Form) => { setBase(x.base); f.reset(valsOf(x)); return JSON.stringify(valsOf(x)); };
  return { f, base, current, load };
}
